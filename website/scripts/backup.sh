#!/bin/bash

# EdGoing 备份管理脚本
# 功能：自动化数据库备份、文件系统备份、压缩存储、备份清理、恢复功能

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 配置变量
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
PROJECT_NAME="edgoing"
RETENTION_DAYS=30
REMOTE_BACKUP=false

# 日志函数
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 显示帮助信息
show_help() {
    echo "EdGoing 备份管理脚本"
    echo
    echo "使用方法:"
    echo "  $0 [命令] [选项]"
    echo
    echo "命令:"
    echo "  backup          创建完整备份"
    echo "  backup-db       仅备份数据库"
    echo "  backup-files    仅备份文件"
    echo "  restore         恢复备份"
    echo "  list            列出所有备份"
    echo "  cleanup         清理过期备份"
    echo "  verify          验证备份完整性"
    echo
    echo "选项:"
    echo "  --remote        启用远程备份"
    echo "  --retention N   设置保留天数 (默认: 30)"
    echo "  --help          显示帮助信息"
    echo
    echo "示例:"
    echo "  $0 backup                    # 创建完整备份"
    echo "  $0 backup --remote           # 创建备份并上传到远程"
    echo "  $0 restore backup_20240101   # 恢复指定备份"
    echo "  $0 cleanup --retention 7     # 清理7天前的备份"
}

# 解析命令行参数
parse_args() {
    COMMAND=""
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            backup|backup-db|backup-files|restore|list|cleanup|verify)
                COMMAND="$1"
                shift
                ;;
            --remote)
                REMOTE_BACKUP=true
                shift
                ;;
            --retention)
                RETENTION_DAYS="$2"
                shift 2
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            *)
                if [[ "$COMMAND" == "restore" && -z "$RESTORE_NAME" ]]; then
                    RESTORE_NAME="$1"
                else
                    log_error "未知参数: $1"
                    show_help
                    exit 1
                fi
                shift
                ;;
        esac
    done
    
    if [[ -z "$COMMAND" ]]; then
        log_error "请指定命令"
        show_help
        exit 1
    fi
}

# 创建备份目录
create_backup_dir() {
    mkdir -p "$BACKUP_DIR"
    mkdir -p "$BACKUP_DIR/database"
    mkdir -p "$BACKUP_DIR/files"
    mkdir -p "$BACKUP_DIR/full"
}

# 检查Docker服务状态
check_docker_services() {
    if ! docker-compose ps | grep -q "Up"; then
        log_warning "Docker服务未运行，某些备份功能可能不可用"
        return 1
    fi
    return 0
}

# 备份数据库
backup_database() {
    log_info "开始备份数据库..."
    
    local backup_file="$BACKUP_DIR/database/db_${TIMESTAMP}.sql"
    
    if check_docker_services; then
        # 使用Docker容器备份
        docker-compose exec -T db pg_dump -U edgoing edgoing > "$backup_file"
    else
        # 直接备份SQLite (开发环境)
        if [[ -f "prisma/dev.db" ]]; then
            cp "prisma/dev.db" "$BACKUP_DIR/database/dev_${TIMESTAMP}.db"
            backup_file="$BACKUP_DIR/database/dev_${TIMESTAMP}.db"
        else
            log_error "未找到数据库文件"
            return 1
        fi
    fi
    
    # 压缩备份文件
    gzip "$backup_file"
    backup_file="${backup_file}.gz"
    
    # 验证备份文件
    if [[ -f "$backup_file" && -s "$backup_file" ]]; then
        local size=$(du -h "$backup_file" | cut -f1)
        log_success "数据库备份完成: $backup_file ($size)"
        echo "$backup_file"
    else
        log_error "数据库备份失败"
        return 1
    fi
}

# 备份文件系统
backup_files() {
    log_info "开始备份文件系统..."
    
    local backup_file="$BACKUP_DIR/files/files_${TIMESTAMP}.tar.gz"
    
    # 备份上传文件和配置
    tar -czf "$backup_file" \
        --exclude='node_modules' \
        --exclude='.next' \
        --exclude='.git' \
        --exclude='backups' \
        --exclude='*.log' \
        public/uploads/ \
        .env \
        docker-compose.yml \
        nginx.conf \
        2>/dev/null || true
    
    # 验证备份文件
    if [[ -f "$backup_file" && -s "$backup_file" ]]; then
        local size=$(du -h "$backup_file" | cut -f1)
        log_success "文件备份完成: $backup_file ($size)"
        echo "$backup_file"
    else
        log_error "文件备份失败"
        return 1
    fi
}

# 创建完整备份
create_full_backup() {
    log_info "开始创建完整备份..."
    
    create_backup_dir
    
    local db_backup=$(backup_database)
    local files_backup=$(backup_files)
    
    if [[ -n "$db_backup" && -n "$files_backup" ]]; then
        # 创建备份清单
        local manifest="$BACKUP_DIR/full/backup_${TIMESTAMP}.manifest"
        cat > "$manifest" << EOF
# EdGoing 备份清单
# 创建时间: $(date)
# 备份类型: 完整备份

DATABASE_BACKUP=$(basename "$db_backup")
FILES_BACKUP=$(basename "$files_backup")
TIMESTAMP=$TIMESTAMP
VERSION=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
EOF
        
        log_success "完整备份创建完成"
        log_info "备份清单: $manifest"
        
        # 远程备份
        if [[ "$REMOTE_BACKUP" == true ]]; then
            upload_to_remote "$db_backup" "$files_backup" "$manifest"
        fi
        
        return 0
    else
        log_error "完整备份失败"
        return 1
    fi
}

# 上传到远程存储
upload_to_remote() {
    log_info "上传备份到远程存储..."
    
    # 这里可以配置不同的远程存储方案
    # 示例：AWS S3
    if command -v aws &> /dev/null && [[ -n "$AWS_S3_BUCKET" ]]; then
        for file in "$@"; do
            aws s3 cp "$file" "s3://$AWS_S3_BUCKET/edgoing-backups/"
            log_info "已上传: $(basename "$file")"
        done
        log_success "远程备份完成"
    # 示例：SCP
    elif [[ -n "$REMOTE_HOST" && -n "$REMOTE_PATH" ]]; then
        for file in "$@"; do
            scp "$file" "$REMOTE_HOST:$REMOTE_PATH/"
            log_info "已上传: $(basename "$file")"
        done
        log_success "远程备份完成"
    else
        log_warning "未配置远程存储，跳过远程备份"
    fi
}

# 列出备份
list_backups() {
    log_info "备份文件列表:"
    echo
    
    if [[ -d "$BACKUP_DIR" ]]; then
        echo "完整备份:"
        find "$BACKUP_DIR/full" -name "*.manifest" -type f 2>/dev/null | sort -r | head -10 | while read -r manifest; do
            local timestamp=$(basename "$manifest" .manifest | sed 's/backup_//')
            local date_formatted=$(date -d "${timestamp:0:8} ${timestamp:9:2}:${timestamp:11:2}:${timestamp:13:2}" "+%Y-%m-%d %H:%M:%S" 2>/dev/null || echo "$timestamp")
            echo "  📦 $timestamp ($date_formatted)"
        done
        
        echo
        echo "数据库备份:"
        find "$BACKUP_DIR/database" -name "*.sql.gz" -o -name "*.db" -type f 2>/dev/null | sort -r | head -5 | while read -r backup; do
            local size=$(du -h "$backup" | cut -f1)
            echo "  🗄️  $(basename "$backup") ($size)"
        done
        
        echo
        echo "文件备份:"
        find "$BACKUP_DIR/files" -name "*.tar.gz" -type f 2>/dev/null | sort -r | head -5 | while read -r backup; do
            local size=$(du -h "$backup" | cut -f1)
            echo "  📁 $(basename "$backup") ($size)"
        done
    else
        log_warning "未找到备份目录"
    fi
}

# 恢复备份
restore_backup() {
    if [[ -z "$RESTORE_NAME" ]]; then
        log_error "请指定要恢复的备份名称"
        list_backups
        return 1
    fi
    
    log_warning "恢复操作将覆盖现有数据，请确认操作"
    echo -n "输入 'YES' 确认恢复: "
    read -r confirm
    
    if [[ "$confirm" != "YES" ]]; then
        log_info "恢复操作已取消"
        return 0
    fi
    
    log_info "开始恢复备份: $RESTORE_NAME"
    
    # 查找备份清单
    local manifest="$BACKUP_DIR/full/backup_${RESTORE_NAME}.manifest"
    
    if [[ ! -f "$manifest" ]]; then
        log_error "未找到备份清单: $manifest"
        return 1
    fi
    
    # 读取备份信息
    source "$manifest"
    
    # 停止服务
    log_info "停止服务..."
    docker-compose down || true
    
    # 恢复数据库
    if [[ -n "$DATABASE_BACKUP" ]]; then
        local db_file="$BACKUP_DIR/database/$DATABASE_BACKUP"
        if [[ -f "$db_file" ]]; then
            log_info "恢复数据库..."
            
            # 启动数据库服务
            docker-compose up -d db
            sleep 10
            
            # 恢复数据
            if [[ "$db_file" == *.gz ]]; then
                gunzip -c "$db_file" | docker-compose exec -T db psql -U edgoing edgoing
            else
                cp "$db_file" "prisma/dev.db"
            fi
            
            log_success "数据库恢复完成"
        else
            log_error "数据库备份文件不存在: $db_file"
        fi
    fi
    
    # 恢复文件
    if [[ -n "$FILES_BACKUP" ]]; then
        local files_file="$BACKUP_DIR/files/$FILES_BACKUP"
        if [[ -f "$files_file" ]]; then
            log_info "恢复文件..."
            tar -xzf "$files_file"
            log_success "文件恢复完成"
        else
            log_error "文件备份不存在: $files_file"
        fi
    fi
    
    # 重启服务
    log_info "重启服务..."
    docker-compose up -d
    
    log_success "备份恢复完成"
}

# 清理过期备份
cleanup_backups() {
    log_info "清理 $RETENTION_DAYS 天前的备份..."
    
    local deleted_count=0
    
    # 清理数据库备份
    find "$BACKUP_DIR/database" -name "*.sql.gz" -o -name "*.db" -type f -mtime +$RETENTION_DAYS 2>/dev/null | while read -r file; do
        rm -f "$file"
        log_info "删除: $(basename "$file")"
        ((deleted_count++))
    done
    
    # 清理文件备份
    find "$BACKUP_DIR/files" -name "*.tar.gz" -type f -mtime +$RETENTION_DAYS 2>/dev/null | while read -r file; do
        rm -f "$file"
        log_info "删除: $(basename "$file")"
        ((deleted_count++))
    done
    
    # 清理备份清单
    find "$BACKUP_DIR/full" -name "*.manifest" -type f -mtime +$RETENTION_DAYS 2>/dev/null | while read -r file; do
        rm -f "$file"
        log_info "删除: $(basename "$file")"
        ((deleted_count++))
    done
    
    log_success "清理完成，删除了 $deleted_count 个文件"
}

# 验证备份完整性
verify_backups() {
    log_info "验证备份完整性..."
    
    local error_count=0
    
    # 验证数据库备份
    find "$BACKUP_DIR/database" -name "*.sql.gz" -type f 2>/dev/null | while read -r file; do
        if ! gunzip -t "$file" 2>/dev/null; then
            log_error "损坏的备份文件: $(basename "$file")"
            ((error_count++))
        fi
    done
    
    # 验证文件备份
    find "$BACKUP_DIR/files" -name "*.tar.gz" -type f 2>/dev/null | while read -r file; do
        if ! tar -tzf "$file" >/dev/null 2>&1; then
            log_error "损坏的备份文件: $(basename "$file")"
            ((error_count++))
        fi
    done
    
    if [[ $error_count -eq 0 ]]; then
        log_success "所有备份文件验证通过"
    else
        log_warning "发现 $error_count 个损坏的备份文件"
    fi
}

# 主函数
main() {
    parse_args "$@"
    
    case "$COMMAND" in
        backup)
            create_full_backup
            ;;
        backup-db)
            create_backup_dir
            backup_database
            ;;
        backup-files)
            create_backup_dir
            backup_files
            ;;
        restore)
            restore_backup
            ;;
        list)
            list_backups
            ;;
        cleanup)
            cleanup_backups
            ;;
        verify)
            verify_backups
            ;;
        *)
            log_error "未知命令: $COMMAND"
            show_help
            exit 1
            ;;
    esac
}

# 错误处理
trap 'log_error "备份操作中发生错误"; exit 1' ERR

# 执行主流程
main "$@"
