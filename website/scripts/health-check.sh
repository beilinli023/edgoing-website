#!/bin/bash

# EdGoing 健康检查脚本
# 功能：检查应用各组件的健康状态

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 配置
APP_URL="http://localhost:3000"
TIMEOUT=10
VERBOSE=false

# 日志函数
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 解析参数
while [[ $# -gt 0 ]]; do
    case $1 in
        --url)
            APP_URL="$2"
            shift 2
            ;;
        --timeout)
            TIMEOUT="$2"
            shift 2
            ;;
        --verbose|-v)
            VERBOSE=true
            shift
            ;;
        --help|-h)
            echo "EdGoing 健康检查脚本"
            echo "使用方法: $0 [选项]"
            echo "选项:"
            echo "  --url URL       应用URL (默认: http://localhost:3000)"
            echo "  --timeout N     超时时间秒数 (默认: 10)"
            echo "  --verbose       详细输出"
            echo "  --help          显示帮助"
            exit 0
            ;;
        *)
            log_error "未知参数: $1"
            exit 1
            ;;
    esac
done

# 检查Docker服务
check_docker_services() {
    log_info "检查Docker服务状态..."
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose 未安装"
        return 1
    fi
    
    local services=(app db redis nginx)
    local failed_services=()
    
    for service in "${services[@]}"; do
        if docker-compose ps "$service" | grep -q "Up"; then
            if [[ "$VERBOSE" == true ]]; then
                log_success "服务 $service 运行正常"
            fi
        else
            log_warning "服务 $service 未运行"
            failed_services+=("$service")
        fi
    done
    
    if [[ ${#failed_services[@]} -eq 0 ]]; then
        log_success "所有Docker服务运行正常"
        return 0
    else
        log_error "以下服务未运行: ${failed_services[*]}"
        return 1
    fi
}

# 检查应用健康状态
check_app_health() {
    log_info "检查应用健康状态..."
    
    local health_url="$APP_URL/api/health"
    
    if curl -f -s --max-time "$TIMEOUT" "$health_url" > /dev/null; then
        log_success "应用健康检查通过"
        
        if [[ "$VERBOSE" == true ]]; then
            local response=$(curl -s --max-time "$TIMEOUT" "$health_url")
            echo "健康检查响应: $response"
        fi
        return 0
    else
        log_error "应用健康检查失败"
        return 1
    fi
}

# 检查数据库连接
check_database() {
    log_info "检查数据库连接..."
    
    if docker-compose exec -T db pg_isready -U edgoing > /dev/null 2>&1; then
        log_success "数据库连接正常"
        
        if [[ "$VERBOSE" == true ]]; then
            local db_info=$(docker-compose exec -T db psql -U edgoing -d edgoing -c "SELECT version();" 2>/dev/null | head -3 | tail -1)
            echo "数据库版本: $db_info"
        fi
        return 0
    else
        log_error "数据库连接失败"
        return 1
    fi
}

# 检查Redis连接
check_redis() {
    log_info "检查Redis连接..."
    
    if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
        log_success "Redis连接正常"
        
        if [[ "$VERBOSE" == true ]]; then
            local redis_info=$(docker-compose exec -T redis redis-cli info server | grep redis_version)
            echo "Redis版本: $redis_info"
        fi
        return 0
    else
        log_warning "Redis连接失败 (可选服务)"
        return 1
    fi
}

# 检查网站可访问性
check_website() {
    log_info "检查网站可访问性..."
    
    local endpoints=(
        "/"
        "/api/health"
        "/admin"
        "/blog"
        "/programs"
    )
    
    local failed_endpoints=()
    
    for endpoint in "${endpoints[@]}"; do
        local url="$APP_URL$endpoint"
        
        if curl -f -s --max-time "$TIMEOUT" "$url" > /dev/null; then
            if [[ "$VERBOSE" == true ]]; then
                log_success "端点 $endpoint 可访问"
            fi
        else
            log_warning "端点 $endpoint 不可访问"
            failed_endpoints+=("$endpoint")
        fi
    done
    
    if [[ ${#failed_endpoints[@]} -eq 0 ]]; then
        log_success "所有网站端点可访问"
        return 0
    else
        log_warning "以下端点不可访问: ${failed_endpoints[*]}"
        return 1
    fi
}

# 检查磁盘空间
check_disk_space() {
    log_info "检查磁盘空间..."
    
    local usage=$(df . | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [[ $usage -lt 80 ]]; then
        log_success "磁盘空间充足 (使用率: ${usage}%)"
        return 0
    elif [[ $usage -lt 90 ]]; then
        log_warning "磁盘空间不足 (使用率: ${usage}%)"
        return 1
    else
        log_error "磁盘空间严重不足 (使用率: ${usage}%)"
        return 1
    fi
}

# 检查内存使用
check_memory() {
    log_info "检查内存使用..."
    
    local memory_info=$(free | awk 'NR==2{printf "%.1f", $3*100/$2}')
    local memory_usage=${memory_info%.*}
    
    if [[ $memory_usage -lt 80 ]]; then
        log_success "内存使用正常 (使用率: ${memory_usage}%)"
        return 0
    elif [[ $memory_usage -lt 90 ]]; then
        log_warning "内存使用较高 (使用率: ${memory_usage}%)"
        return 1
    else
        log_error "内存使用过高 (使用率: ${memory_usage}%)"
        return 1
    fi
}

# 检查日志错误
check_logs() {
    log_info "检查应用日志..."
    
    local error_count=$(docker-compose logs app --since="1h" 2>/dev/null | grep -i error | wc -l)
    
    if [[ $error_count -eq 0 ]]; then
        log_success "近1小时内无错误日志"
        return 0
    elif [[ $error_count -lt 10 ]]; then
        log_warning "近1小时内有 $error_count 条错误日志"
        return 1
    else
        log_error "近1小时内有 $error_count 条错误日志"
        return 1
    fi
}

# 生成健康报告
generate_report() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local report_file="health-report-$(date +%Y%m%d_%H%M%S).txt"
    
    {
        echo "EdGoing 健康检查报告"
        echo "生成时间: $timestamp"
        echo "检查URL: $APP_URL"
        echo "================================"
        echo
        
        echo "Docker服务状态:"
        docker-compose ps 2>/dev/null || echo "Docker Compose 不可用"
        echo
        
        echo "系统资源使用:"
        echo "磁盘使用: $(df . | awk 'NR==2 {print $5}')"
        echo "内存使用: $(free | awk 'NR==2{printf "%.1f%%", $3*100/$2}')"
        echo "负载平均: $(uptime | awk -F'load average:' '{print $2}')"
        echo
        
        echo "应用日志 (最近10条错误):"
        docker-compose logs app --since="1h" 2>/dev/null | grep -i error | tail -10 || echo "无错误日志"
        
    } > "$report_file"
    
    log_info "健康报告已生成: $report_file"
}

# 主函数
main() {
    echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║                EdGoing 健康检查                               ║${NC}"
    echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo
    
    local checks=(
        "check_docker_services"
        "check_app_health"
        "check_database"
        "check_redis"
        "check_website"
        "check_disk_space"
        "check_memory"
        "check_logs"
    )
    
    local passed=0
    local failed=0
    local warnings=0
    
    for check in "${checks[@]}"; do
        if $check; then
            ((passed++))
        else
            if [[ "$check" == "check_redis" ]]; then
                ((warnings++))
            else
                ((failed++))
            fi
        fi
        echo
    done
    
    # 总结
    echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║                    检查结果总结                               ║${NC}"
    echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo -e "${GREEN}✅ 通过: $passed${NC}"
    echo -e "${YELLOW}⚠️  警告: $warnings${NC}"
    echo -e "${RED}❌ 失败: $failed${NC}"
    echo
    
    if [[ "$VERBOSE" == true ]]; then
        generate_report
    fi
    
    # 返回状态码
    if [[ $failed -eq 0 ]]; then
        log_success "🎉 所有关键检查都通过了！"
        exit 0
    else
        log_error "❌ 发现 $failed 个关键问题，请检查并修复"
        exit 1
    fi
}

# 执行主流程
main "$@"
