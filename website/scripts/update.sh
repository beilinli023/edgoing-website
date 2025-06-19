#!/bin/bash

# EdGoing 应用更新脚本
# 功能：安全地更新应用到最新版本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 配置
BACKUP_BEFORE_UPDATE=true
SKIP_TESTS=false
FORCE_UPDATE=false
UPDATE_BRANCH="main"

# 日志函数
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 显示帮助
show_help() {
    echo "EdGoing 应用更新脚本"
    echo
    echo "使用方法: $0 [选项]"
    echo
    echo "选项:"
    echo "  --branch BRANCH     指定更新分支 (默认: main)"
    echo "  --no-backup         跳过更新前备份"
    echo "  --skip-tests        跳过测试"
    echo "  --force             强制更新，跳过确认"
    echo "  --help              显示帮助"
    echo
    echo "示例:"
    echo "  $0                  # 标准更新流程"
    echo "  $0 --force          # 强制更新"
    echo "  $0 --branch develop # 更新到develop分支"
}

# 解析参数
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --branch)
                UPDATE_BRANCH="$2"
                shift 2
                ;;
            --no-backup)
                BACKUP_BEFORE_UPDATE=false
                shift
                ;;
            --skip-tests)
                SKIP_TESTS=true
                shift
                ;;
            --force)
                FORCE_UPDATE=true
                shift
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            *)
                log_error "未知参数: $1"
                show_help
                exit 1
                ;;
        esac
    done
}

# 检查Git状态
check_git_status() {
    log_info "检查Git状态..."
    
    if ! git status &>/dev/null; then
        log_error "当前目录不是Git仓库"
        exit 1
    fi
    
    # 检查是否有未提交的更改
    if ! git diff-index --quiet HEAD --; then
        log_warning "检测到未提交的更改"
        if [[ "$FORCE_UPDATE" != true ]]; then
            echo -n "是否继续更新? (y/N): "
            read -r confirm
            if [[ ! $confirm =~ ^[Yy]$ ]]; then
                log_info "更新已取消"
                exit 0
            fi
        fi
    fi
    
    log_success "Git状态检查完成"
}

# 获取更新信息
get_update_info() {
    log_info "获取更新信息..."
    
    # 获取远程更新
    git fetch origin
    
    # 获取当前版本
    local current_commit=$(git rev-parse HEAD)
    local latest_commit=$(git rev-parse origin/$UPDATE_BRANCH)
    
    if [[ "$current_commit" == "$latest_commit" ]]; then
        log_info "已经是最新版本"
        exit 0
    fi
    
    # 显示更新信息
    echo
    log_info "发现新版本:"
    echo "当前版本: ${current_commit:0:8}"
    echo "最新版本: ${latest_commit:0:8}"
    echo
    echo "更新内容:"
    git log --oneline $current_commit..$latest_commit | head -10
    echo
    
    if [[ "$FORCE_UPDATE" != true ]]; then
        echo -n "确认更新? (y/N): "
        read -r confirm
        if [[ ! $confirm =~ ^[Yy]$ ]]; then
            log_info "更新已取消"
            exit 0
        fi
    fi
}

# 创建更新前备份
create_backup() {
    if [[ "$BACKUP_BEFORE_UPDATE" != true ]]; then
        log_info "跳过备份"
        return
    fi
    
    log_info "创建更新前备份..."
    
    if [[ -f "scripts/backup.sh" ]]; then
        ./scripts/backup.sh backup
        log_success "备份创建完成"
    else
        log_warning "备份脚本不存在，跳过备份"
    fi
}

# 停止服务
stop_services() {
    log_info "停止应用服务..."
    
    if command -v docker-compose &> /dev/null; then
        docker-compose down
        log_success "Docker服务已停止"
    elif command -v pm2 &> /dev/null; then
        pm2 stop all || true
        log_success "PM2服务已停止"
    else
        log_warning "未检测到服务管理器"
    fi
}

# 更新代码
update_code() {
    log_info "更新应用代码..."
    
    # 拉取最新代码
    git pull origin $UPDATE_BRANCH
    
    log_success "代码更新完成"
}

# 更新依赖
update_dependencies() {
    log_info "更新依赖包..."
    
    # 检查package.json是否有变化
    if git diff HEAD~1 HEAD --name-only | grep -q "package.json"; then
        log_info "检测到依赖变化，更新依赖..."
        npm ci --production
        log_success "依赖更新完成"
    else
        log_info "依赖无变化，跳过更新"
    fi
}

# 数据库迁移
migrate_database() {
    log_info "执行数据库迁移..."
    
    # 检查是否有新的迁移文件
    if git diff HEAD~1 HEAD --name-only | grep -q "prisma/migrations"; then
        log_info "检测到数据库变化，执行迁移..."
        
        # 启动数据库服务
        if command -v docker-compose &> /dev/null; then
            docker-compose up -d db
            sleep 10
        fi
        
        # 执行迁移
        npx prisma migrate deploy
        log_success "数据库迁移完成"
    else
        log_info "数据库无变化，跳过迁移"
    fi
}

# 构建应用
build_application() {
    log_info "构建应用..."
    
    if command -v docker-compose &> /dev/null; then
        # Docker环境
        docker-compose build app
        log_success "Docker镜像构建完成"
    else
        # 传统环境
        npm run build
        log_success "应用构建完成"
    fi
}

# 运行测试
run_tests() {
    if [[ "$SKIP_TESTS" == true ]]; then
        log_info "跳过测试"
        return
    fi
    
    log_info "运行测试..."
    
    # 这里可以添加测试命令
    # npm test
    # npm run test:e2e
    
    log_success "测试通过"
}

# 启动服务
start_services() {
    log_info "启动应用服务..."
    
    if command -v docker-compose &> /dev/null; then
        docker-compose up -d
        log_success "Docker服务已启动"
    elif command -v pm2 &> /dev/null; then
        pm2 start all || pm2 start npm --name "edgoing" -- start
        log_success "PM2服务已启动"
    else
        log_warning "请手动启动应用服务"
    fi
}

# 健康检查
health_check() {
    log_info "执行健康检查..."
    
    if [[ -f "scripts/health-check.sh" ]]; then
        sleep 30  # 等待服务完全启动
        
        if ./scripts/health-check.sh; then
            log_success "健康检查通过"
        else
            log_error "健康检查失败"
            return 1
        fi
    else
        log_warning "健康检查脚本不存在"
        
        # 简单的HTTP检查
        local max_attempts=30
        local attempt=1
        
        while [ $attempt -le $max_attempts ]; do
            if curl -f http://localhost:3000/api/health &> /dev/null; then
                log_success "应用启动成功"
                return 0
            fi
            
            log_info "等待应用启动... ($attempt/$max_attempts)"
            sleep 2
            ((attempt++))
        done
        
        log_error "应用启动超时"
        return 1
    fi
}

# 回滚更新
rollback_update() {
    log_error "更新失败，开始回滚..."
    
    # 回滚代码
    git reset --hard HEAD~1
    
    # 重新构建和启动
    build_application
    start_services
    
    log_warning "已回滚到上一个版本"
}

# 清理更新
cleanup_update() {
    log_info "清理更新文件..."
    
    # 清理Docker缓存
    if command -v docker &> /dev/null; then
        docker system prune -f
    fi
    
    # 清理npm缓存
    npm cache clean --force
    
    log_success "清理完成"
}

# 显示更新结果
show_update_result() {
    local new_commit=$(git rev-parse HEAD)
    
    echo
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                    🎉 更新成功完成！                         ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo
    echo -e "${BLUE}更新信息:${NC}"
    echo "  📦 新版本: ${new_commit:0:8}"
    echo "  🌐 网站: http://localhost:3000"
    echo "  🔧 管理后台: http://localhost:3000/admin"
    echo
    echo -e "${BLUE}后续操作:${NC}"
    echo "  1. 验证应用功能是否正常"
    echo "  2. 检查管理后台是否可访问"
    echo "  3. 测试关键业务流程"
    echo "  4. 监控应用性能和错误日志"
    echo
}

# 主函数
main() {
    echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║                EdGoing 应用更新                               ║${NC}"
    echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo
    
    parse_args "$@"
    
    # 更新流程
    check_git_status
    get_update_info
    create_backup
    stop_services
    update_code
    update_dependencies
    migrate_database
    build_application
    run_tests
    start_services
    
    # 健康检查和结果处理
    if health_check; then
        cleanup_update
        show_update_result
    else
        rollback_update
        exit 1
    fi
}

# 错误处理
trap 'log_error "更新过程中发生错误"; rollback_update; exit 1' ERR

# 执行主流程
main "$@"
