import { PrismaClient } from '@prisma/client'
import { nanoid } from 'nanoid'

const prisma = new PrismaClient()

const provincesData = [
  {
    nameZh: '北京市',
    nameEn: 'Beijing',
    code: 'BJ',
    order: 1,
    cities: [
      { nameZh: '东城区', nameEn: 'Dongcheng District', code: 'BJ-DC' },
      { nameZh: '西城区', nameEn: 'Xicheng District', code: 'BJ-XC' },
      { nameZh: '朝阳区', nameEn: 'Chaoyang District', code: 'BJ-CY' },
      { nameZh: '丰台区', nameEn: 'Fengtai District', code: 'BJ-FT' },
      { nameZh: '石景山区', nameEn: 'Shijingshan District', code: 'BJ-SJS' },
      { nameZh: '海淀区', nameEn: 'Haidian District', code: 'BJ-HD' },
      { nameZh: '门头沟区', nameEn: 'Mentougou District', code: 'BJ-MTG' },
      { nameZh: '房山区', nameEn: 'Fangshan District', code: 'BJ-FS' },
      { nameZh: '通州区', nameEn: 'Tongzhou District', code: 'BJ-TZ' },
      { nameZh: '顺义区', nameEn: 'Shunyi District', code: 'BJ-SY' },
      { nameZh: '昌平区', nameEn: 'Changping District', code: 'BJ-CP' },
      { nameZh: '大兴区', nameEn: 'Daxing District', code: 'BJ-DX' },
      { nameZh: '怀柔区', nameEn: 'Huairou District', code: 'BJ-HR' },
      { nameZh: '平谷区', nameEn: 'Pinggu District', code: 'BJ-PG' },
      { nameZh: '密云区', nameEn: 'Miyun District', code: 'BJ-MY' },
      { nameZh: '延庆区', nameEn: 'Yanqing District', code: 'BJ-YQ' }
    ]
  },
  {
    nameZh: '上海市',
    nameEn: 'Shanghai',
    code: 'SH',
    order: 2,
    cities: [
      { nameZh: '黄浦区', nameEn: 'Huangpu District', code: 'SH-HP' },
      { nameZh: '徐汇区', nameEn: 'Xuhui District', code: 'SH-XH' },
      { nameZh: '长宁区', nameEn: 'Changning District', code: 'SH-CN' },
      { nameZh: '静安区', nameEn: 'Jing\'an District', code: 'SH-JA' },
      { nameZh: '普陀区', nameEn: 'Putuo District', code: 'SH-PT' },
      { nameZh: '虹口区', nameEn: 'Hongkou District', code: 'SH-HK' },
      { nameZh: '杨浦区', nameEn: 'Yangpu District', code: 'SH-YP' },
      { nameZh: '闵行区', nameEn: 'Minhang District', code: 'SH-MH' },
      { nameZh: '宝山区', nameEn: 'Baoshan District', code: 'SH-BS' },
      { nameZh: '嘉定区', nameEn: 'Jiading District', code: 'SH-JD' },
      { nameZh: '浦东新区', nameEn: 'Pudong New Area', code: 'SH-PD' },
      { nameZh: '金山区', nameEn: 'Jinshan District', code: 'SH-JS' },
      { nameZh: '松江区', nameEn: 'Songjiang District', code: 'SH-SJ' },
      { nameZh: '青浦区', nameEn: 'Qingpu District', code: 'SH-QP' },
      { nameZh: '奉贤区', nameEn: 'Fengxian District', code: 'SH-FX' },
      { nameZh: '崇明区', nameEn: 'Chongming District', code: 'SH-CM' }
    ]
  },
  {
    nameZh: '天津市',
    nameEn: 'Tianjin',
    code: 'TJ',
    order: 3,
    cities: [
      { nameZh: '和平区', nameEn: 'Heping District', code: 'TJ-HP' },
      { nameZh: '河东区', nameEn: 'Hedong District', code: 'TJ-HD' },
      { nameZh: '河西区', nameEn: 'Hexi District', code: 'TJ-HX' },
      { nameZh: '南开区', nameEn: 'Nankai District', code: 'TJ-NK' },
      { nameZh: '河北区', nameEn: 'Hebei District', code: 'TJ-HB' },
      { nameZh: '红桥区', nameEn: 'Hongqiao District', code: 'TJ-HQ' },
      { nameZh: '东丽区', nameEn: 'Dongli District', code: 'TJ-DL' },
      { nameZh: '西青区', nameEn: 'Xiqing District', code: 'TJ-XQ' },
      { nameZh: '津南区', nameEn: 'Jinnan District', code: 'TJ-JN' },
      { nameZh: '北辰区', nameEn: 'Beichen District', code: 'TJ-BC' },
      { nameZh: '武清区', nameEn: 'Wuqing District', code: 'TJ-WQ' },
      { nameZh: '宝坻区', nameEn: 'Baodi District', code: 'TJ-BD' },
      { nameZh: '滨海新区', nameEn: 'Binhai New Area', code: 'TJ-BH' },
      { nameZh: '宁河区', nameEn: 'Ninghe District', code: 'TJ-NH' },
      { nameZh: '静海区', nameEn: 'Jinghai District', code: 'TJ-JH' },
      { nameZh: '蓟州区', nameEn: 'Jizhou District', code: 'TJ-JZ' }
    ]
  },
  {
    nameZh: '重庆市',
    nameEn: 'Chongqing',
    code: 'CQ',
    order: 4,
    cities: [
      { nameZh: '万州区', nameEn: 'Wanzhou District', code: 'CQ-WZ' },
      { nameZh: '涪陵区', nameEn: 'Fuling District', code: 'CQ-FL' },
      { nameZh: '渝中区', nameEn: 'Yuzhong District', code: 'CQ-YZ' },
      { nameZh: '大渡口区', nameEn: 'Dadukou District', code: 'CQ-DDK' },
      { nameZh: '江北区', nameEn: 'Jiangbei District', code: 'CQ-JB' },
      { nameZh: '沙坪坝区', nameEn: 'Shapingba District', code: 'CQ-SPB' },
      { nameZh: '九龙坡区', nameEn: 'Jiulongpo District', code: 'CQ-JLP' },
      { nameZh: '南岸区', nameEn: 'Nan\'an District', code: 'CQ-NA' },
      { nameZh: '北碚区', nameEn: 'Beibei District', code: 'CQ-BB' },
      { nameZh: '綦江区', nameEn: 'Qijiang District', code: 'CQ-QJ' },
      { nameZh: '大足区', nameEn: 'Dazu District', code: 'CQ-DZ' },
      { nameZh: '渝北区', nameEn: 'Yubei District', code: 'CQ-YB' },
      { nameZh: '巴南区', nameEn: 'Banan District', code: 'CQ-BN' },
      { nameZh: '黔江区', nameEn: 'Qianjiang District', code: 'CQ-QJG' },
      { nameZh: '长寿区', nameEn: 'Changshou District', code: 'CQ-CS' },
      { nameZh: '江津区', nameEn: 'Jiangjin District', code: 'CQ-JJ' },
      { nameZh: '合川区', nameEn: 'Hechuan District', code: 'CQ-HC' },
      { nameZh: '永川区', nameEn: 'Yongchuan District', code: 'CQ-YC' },
      { nameZh: '南川区', nameEn: 'Nanchuan District', code: 'CQ-NC' },
      { nameZh: '璧山区', nameEn: 'Bishan District', code: 'CQ-BS' },
      { nameZh: '铜梁区', nameEn: 'Tongliang District', code: 'CQ-TL' },
      { nameZh: '潼南区', nameEn: 'Tongnan District', code: 'CQ-TN' },
      { nameZh: '荣昌区', nameEn: 'Rongchang District', code: 'CQ-RC' }
    ]
  },
  {
    nameZh: '河北省',
    nameEn: 'Hebei Province',
    code: 'HE',
    order: 5,
    cities: [
      { nameZh: '石家庄市', nameEn: 'Shijiazhuang', code: 'HE-SJZ' },
      { nameZh: '唐山市', nameEn: 'Tangshan', code: 'HE-TS' },
      { nameZh: '秦皇岛市', nameEn: 'Qinhuangdao', code: 'HE-QHD' },
      { nameZh: '邯郸市', nameEn: 'Handan', code: 'HE-HD' },
      { nameZh: '邢台市', nameEn: 'Xingtai', code: 'HE-XT' },
      { nameZh: '保定市', nameEn: 'Baoding', code: 'HE-BD' },
      { nameZh: '张家口市', nameEn: 'Zhangjiakou', code: 'HE-ZJK' },
      { nameZh: '承德市', nameEn: 'Chengde', code: 'HE-CD' },
      { nameZh: '沧州市', nameEn: 'Cangzhou', code: 'HE-CZ' },
      { nameZh: '廊坊市', nameEn: 'Langfang', code: 'HE-LF' },
      { nameZh: '衡水市', nameEn: 'Hengshui', code: 'HE-HS' }
    ]
  },
  {
    nameZh: '山西省',
    nameEn: 'Shanxi Province',
    code: 'SX',
    order: 6,
    cities: [
      { nameZh: '太原市', nameEn: 'Taiyuan', code: 'SX-TY' },
      { nameZh: '大同市', nameEn: 'Datong', code: 'SX-DT' },
      { nameZh: '阳泉市', nameEn: 'Yangquan', code: 'SX-YQ' },
      { nameZh: '长治市', nameEn: 'Changzhi', code: 'SX-CZ' },
      { nameZh: '晋城市', nameEn: 'Jincheng', code: 'SX-JC' },
      { nameZh: '朔州市', nameEn: 'Shuozhou', code: 'SX-SZ' },
      { nameZh: '晋中市', nameEn: 'Jinzhong', code: 'SX-JZ' },
      { nameZh: '运城市', nameEn: 'Yuncheng', code: 'SX-YC' },
      { nameZh: '忻州市', nameEn: 'Xinzhou', code: 'SX-XZ' },
      { nameZh: '临汾市', nameEn: 'Linfen', code: 'SX-LF' },
      { nameZh: '吕梁市', nameEn: 'Lüliang', code: 'SX-LL' }
    ]
  },
  {
    nameZh: '内蒙古自治区',
    nameEn: 'Inner Mongolia',
    code: 'NM',
    order: 7,
    cities: [
      { nameZh: '呼和浩特市', nameEn: 'Hohhot', code: 'NM-HHHT' },
      { nameZh: '包头市', nameEn: 'Baotou', code: 'NM-BT' },
      { nameZh: '乌海市', nameEn: 'Wuhai', code: 'NM-WH' },
      { nameZh: '赤峰市', nameEn: 'Chifeng', code: 'NM-CF' },
      { nameZh: '通辽市', nameEn: 'Tongliao', code: 'NM-TL' },
      { nameZh: '鄂尔多斯市', nameEn: 'Ordos', code: 'NM-EEDS' },
      { nameZh: '呼伦贝尔市', nameEn: 'Hulunbuir', code: 'NM-HLBE' },
      { nameZh: '巴彦淖尔市', nameEn: 'Bayannur', code: 'NM-BYNE' },
      { nameZh: '乌兰察布市', nameEn: 'Ulanqab', code: 'NM-WLCB' }
    ]
  },
  {
    nameZh: '辽宁省',
    nameEn: 'Liaoning Province',
    code: 'LN',
    order: 8,
    cities: [
      { nameZh: '沈阳市', nameEn: 'Shenyang', code: 'LN-SY' },
      { nameZh: '大连市', nameEn: 'Dalian', code: 'LN-DL' },
      { nameZh: '鞍山市', nameEn: 'Anshan', code: 'LN-AS' },
      { nameZh: '抚顺市', nameEn: 'Fushun', code: 'LN-FS' },
      { nameZh: '本溪市', nameEn: 'Benxi', code: 'LN-BX' },
      { nameZh: '丹东市', nameEn: 'Dandong', code: 'LN-DD' },
      { nameZh: '锦州市', nameEn: 'Jinzhou', code: 'LN-JZ' },
      { nameZh: '营口市', nameEn: 'Yingkou', code: 'LN-YK' },
      { nameZh: '阜新市', nameEn: 'Fuxin', code: 'LN-FX' },
      { nameZh: '辽阳市', nameEn: 'Liaoyang', code: 'LN-LY' },
      { nameZh: '盘锦市', nameEn: 'Panjin', code: 'LN-PJ' },
      { nameZh: '铁岭市', nameEn: 'Tieling', code: 'LN-TL' },
      { nameZh: '朝阳市', nameEn: 'Chaoyang', code: 'LN-CY' },
      { nameZh: '葫芦岛市', nameEn: 'Huludao', code: 'LN-HLD' }
    ]
  },
  {
    nameZh: '吉林省',
    nameEn: 'Jilin Province',
    code: 'JL',
    order: 9,
    cities: [
      { nameZh: '长春市', nameEn: 'Changchun', code: 'JL-CC' },
      { nameZh: '吉林市', nameEn: 'Jilin', code: 'JL-JL' },
      { nameZh: '四平市', nameEn: 'Siping', code: 'JL-SP' },
      { nameZh: '辽源市', nameEn: 'Liaoyuan', code: 'JL-LY' },
      { nameZh: '通化市', nameEn: 'Tonghua', code: 'JL-TH' },
      { nameZh: '白山市', nameEn: 'Baishan', code: 'JL-BS' },
      { nameZh: '松原市', nameEn: 'Songyuan', code: 'JL-SY' },
      { nameZh: '白城市', nameEn: 'Baicheng', code: 'JL-BC' }
    ]
  },
  {
    nameZh: '黑龙江省',
    nameEn: 'Heilongjiang Province',
    code: 'HL',
    order: 10,
    cities: [
      { nameZh: '哈尔滨市', nameEn: 'Harbin', code: 'HL-HEB' },
      { nameZh: '齐齐哈尔市', nameEn: 'Qiqihar', code: 'HL-QQHE' },
      { nameZh: '鸡西市', nameEn: 'Jixi', code: 'HL-JX' },
      { nameZh: '鹤岗市', nameEn: 'Hegang', code: 'HL-HG' },
      { nameZh: '双鸭山市', nameEn: 'Shuangyashan', code: 'HL-SYS' },
      { nameZh: '大庆市', nameEn: 'Daqing', code: 'HL-DQ' },
      { nameZh: '伊春市', nameEn: 'Yichun', code: 'HL-YC' },
      { nameZh: '佳木斯市', nameEn: 'Jiamusi', code: 'HL-JMS' },
      { nameZh: '七台河市', nameEn: 'Qitaihe', code: 'HL-QTH' },
      { nameZh: '牡丹江市', nameEn: 'Mudanjiang', code: 'HL-MDJ' },
      { nameZh: '黑河市', nameEn: 'Heihe', code: 'HL-HH' },
      { nameZh: '绥化市', nameEn: 'Suihua', code: 'HL-SH' }
    ]
  },
  {
    nameZh: '江苏省',
    nameEn: 'Jiangsu Province',
    code: 'JS',
    order: 11,
    cities: [
      { nameZh: '南京市', nameEn: 'Nanjing', code: 'JS-NJ' },
      { nameZh: '无锡市', nameEn: 'Wuxi', code: 'JS-WX' },
      { nameZh: '徐州市', nameEn: 'Xuzhou', code: 'JS-XZ' },
      { nameZh: '常州市', nameEn: 'Changzhou', code: 'JS-CZ' },
      { nameZh: '苏州市', nameEn: 'Suzhou', code: 'JS-SZ' },
      { nameZh: '南通市', nameEn: 'Nantong', code: 'JS-NT' },
      { nameZh: '连云港市', nameEn: 'Lianyungang', code: 'JS-LYG' },
      { nameZh: '淮安市', nameEn: 'Huai\'an', code: 'JS-HA' },
      { nameZh: '盐城市', nameEn: 'Yancheng', code: 'JS-YC' },
      { nameZh: '扬州市', nameEn: 'Yangzhou', code: 'JS-YZ' },
      { nameZh: '镇江市', nameEn: 'Zhenjiang', code: 'JS-ZJ' },
      { nameZh: '泰州市', nameEn: 'Taizhou', code: 'JS-TZ' },
      { nameZh: '宿迁市', nameEn: 'Suqian', code: 'JS-SQ' }
    ]
  },
  {
    nameZh: '浙江省',
    nameEn: 'Zhejiang Province',
    code: 'ZJ',
    order: 12,
    cities: [
      { nameZh: '杭州市', nameEn: 'Hangzhou', code: 'ZJ-HZ' },
      { nameZh: '宁波市', nameEn: 'Ningbo', code: 'ZJ-NB' },
      { nameZh: '温州市', nameEn: 'Wenzhou', code: 'ZJ-WZ' },
      { nameZh: '嘉兴市', nameEn: 'Jiaxing', code: 'ZJ-JX' },
      { nameZh: '湖州市', nameEn: 'Huzhou', code: 'ZJ-HZ2' },
      { nameZh: '绍兴市', nameEn: 'Shaoxing', code: 'ZJ-SX' },
      { nameZh: '金华市', nameEn: 'Jinhua', code: 'ZJ-JH' },
      { nameZh: '衢州市', nameEn: 'Quzhou', code: 'ZJ-QZ' },
      { nameZh: '舟山市', nameEn: 'Zhoushan', code: 'ZJ-ZS' },
      { nameZh: '台州市', nameEn: 'Taizhou', code: 'ZJ-TZ' },
      { nameZh: '丽水市', nameEn: 'Lishui', code: 'ZJ-LS' }
    ]
  },
  {
    nameZh: '安徽省',
    nameEn: 'Anhui Province',
    code: 'AH',
    order: 13,
    cities: [
      { nameZh: '合肥市', nameEn: 'Hefei', code: 'AH-HF' },
      { nameZh: '芜湖市', nameEn: 'Wuhu', code: 'AH-WH' },
      { nameZh: '蚌埠市', nameEn: 'Bengbu', code: 'AH-BB' },
      { nameZh: '淮南市', nameEn: 'Huainan', code: 'AH-HN' },
      { nameZh: '马鞍山市', nameEn: 'Ma\'anshan', code: 'AH-MAS' },
      { nameZh: '淮北市', nameEn: 'Huaibei', code: 'AH-HB' },
      { nameZh: '铜陵市', nameEn: 'Tongling', code: 'AH-TL' },
      { nameZh: '安庆市', nameEn: 'Anqing', code: 'AH-AQ' },
      { nameZh: '黄山市', nameEn: 'Huangshan', code: 'AH-HS' },
      { nameZh: '滁州市', nameEn: 'Chuzhou', code: 'AH-CZ' },
      { nameZh: '阜阳市', nameEn: 'Fuyang', code: 'AH-FY' },
      { nameZh: '宿州市', nameEn: 'Suzhou', code: 'AH-SZ' },
      { nameZh: '六安市', nameEn: 'Lu\'an', code: 'AH-LA' },
      { nameZh: '亳州市', nameEn: 'Bozhou', code: 'AH-BZ' },
      { nameZh: '池州市', nameEn: 'Chizhou', code: 'AH-CZ2' },
      { nameZh: '宣城市', nameEn: 'Xuancheng', code: 'AH-XC' }
    ]
  },
  {
    nameZh: '福建省',
    nameEn: 'Fujian Province',
    code: 'FJ',
    order: 14,
    cities: [
      { nameZh: '福州市', nameEn: 'Fuzhou', code: 'FJ-FZ' },
      { nameZh: '厦门市', nameEn: 'Xiamen', code: 'FJ-XM' },
      { nameZh: '莆田市', nameEn: 'Putian', code: 'FJ-PT' },
      { nameZh: '三明市', nameEn: 'Sanming', code: 'FJ-SM' },
      { nameZh: '泉州市', nameEn: 'Quanzhou', code: 'FJ-QZ' },
      { nameZh: '漳州市', nameEn: 'Zhangzhou', code: 'FJ-ZZ' },
      { nameZh: '南平市', nameEn: 'Nanping', code: 'FJ-NP' },
      { nameZh: '龙岩市', nameEn: 'Longyan', code: 'FJ-LY' },
      { nameZh: '宁德市', nameEn: 'Ningde', code: 'FJ-ND' }
    ]
  },
  {
    nameZh: '江西省',
    nameEn: 'Jiangxi Province',
    code: 'JX',
    order: 15,
    cities: [
      { nameZh: '南昌市', nameEn: 'Nanchang', code: 'JX-NC' },
      { nameZh: '景德镇市', nameEn: 'Jingdezhen', code: 'JX-JDZ' },
      { nameZh: '萍乡市', nameEn: 'Pingxiang', code: 'JX-PX' },
      { nameZh: '九江市', nameEn: 'Jiujiang', code: 'JX-JJ' },
      { nameZh: '新余市', nameEn: 'Xinyu', code: 'JX-XY' },
      { nameZh: '鹰潭市', nameEn: 'Yingtan', code: 'JX-YT' },
      { nameZh: '赣州市', nameEn: 'Ganzhou', code: 'JX-GZ' },
      { nameZh: '吉安市', nameEn: 'Ji\'an', code: 'JX-JA' },
      { nameZh: '宜春市', nameEn: 'Yichun', code: 'JX-YC' },
      { nameZh: '抚州市', nameEn: 'Fuzhou', code: 'JX-FZ' },
      { nameZh: '上饶市', nameEn: 'Shangrao', code: 'JX-SR' }
    ]
  },
  {
    nameZh: '山东省',
    nameEn: 'Shandong Province',
    code: 'SD',
    order: 16,
    cities: [
      { nameZh: '济南市', nameEn: 'Jinan', code: 'SD-JN' },
      { nameZh: '青岛市', nameEn: 'Qingdao', code: 'SD-QD' },
      { nameZh: '淄博市', nameEn: 'Zibo', code: 'SD-ZB' },
      { nameZh: '枣庄市', nameEn: 'Zaozhuang', code: 'SD-ZZ' },
      { nameZh: '东营市', nameEn: 'Dongying', code: 'SD-DY' },
      { nameZh: '烟台市', nameEn: 'Yantai', code: 'SD-YT' },
      { nameZh: '潍坊市', nameEn: 'Weifang', code: 'SD-WF' },
      { nameZh: '济宁市', nameEn: 'Jining', code: 'SD-JNG' },
      { nameZh: '泰安市', nameEn: 'Tai\'an', code: 'SD-TA' },
      { nameZh: '威海市', nameEn: 'Weihai', code: 'SD-WH' },
      { nameZh: '日照市', nameEn: 'Rizhao', code: 'SD-RZ' },
      { nameZh: '临沂市', nameEn: 'Linyi', code: 'SD-LY' },
      { nameZh: '德州市', nameEn: 'Dezhou', code: 'SD-DZ' },
      { nameZh: '聊城市', nameEn: 'Liaocheng', code: 'SD-LC' },
      { nameZh: '滨州市', nameEn: 'Binzhou', code: 'SD-BZ' },
      { nameZh: '菏泽市', nameEn: 'Heze', code: 'SD-HZ' }
    ]
  },
  {
    nameZh: '河南省',
    nameEn: 'Henan Province',
    code: 'HA',
    order: 17,
    cities: [
      { nameZh: '郑州市', nameEn: 'Zhengzhou', code: 'HA-ZZ' },
      { nameZh: '开封市', nameEn: 'Kaifeng', code: 'HA-KF' },
      { nameZh: '洛阳市', nameEn: 'Luoyang', code: 'HA-LY' },
      { nameZh: '平顶山市', nameEn: 'Pingdingshan', code: 'HA-PDS' },
      { nameZh: '安阳市', nameEn: 'Anyang', code: 'HA-AY' },
      { nameZh: '鹤壁市', nameEn: 'Hebi', code: 'HA-HB' },
      { nameZh: '新乡市', nameEn: 'Xinxiang', code: 'HA-XX' },
      { nameZh: '焦作市', nameEn: 'Jiaozuo', code: 'HA-JZ' },
      { nameZh: '濮阳市', nameEn: 'Puyang', code: 'HA-PY' },
      { nameZh: '许昌市', nameEn: 'Xuchang', code: 'HA-XC' },
      { nameZh: '漯河市', nameEn: 'Luohe', code: 'HA-LH' },
      { nameZh: '三门峡市', nameEn: 'Sanmenxia', code: 'HA-SMX' },
      { nameZh: '南阳市', nameEn: 'Nanyang', code: 'HA-NY' },
      { nameZh: '商丘市', nameEn: 'Shangqiu', code: 'HA-SQ' },
      { nameZh: '信阳市', nameEn: 'Xinyang', code: 'HA-XY' },
      { nameZh: '周口市', nameEn: 'Zhoukou', code: 'HA-ZK' },
      { nameZh: '驻马店市', nameEn: 'Zhumadian', code: 'HA-ZMD' }
    ]
  },
  {
    nameZh: '湖北省',
    nameEn: 'Hubei Province',
    code: 'HB',
    order: 18,
    cities: [
      { nameZh: '武汉市', nameEn: 'Wuhan', code: 'HB-WH' },
      { nameZh: '黄石市', nameEn: 'Huangshi', code: 'HB-HS' },
      { nameZh: '十堰市', nameEn: 'Shiyan', code: 'HB-SY' },
      { nameZh: '宜昌市', nameEn: 'Yichang', code: 'HB-YC' },
      { nameZh: '襄阳市', nameEn: 'Xiangyang', code: 'HB-XY' },
      { nameZh: '鄂州市', nameEn: 'Ezhou', code: 'HB-EZ' },
      { nameZh: '荆门市', nameEn: 'Jingmen', code: 'HB-JM' },
      { nameZh: '孝感市', nameEn: 'Xiaogan', code: 'HB-XG' },
      { nameZh: '荆州市', nameEn: 'Jingzhou', code: 'HB-JZ' },
      { nameZh: '黄冈市', nameEn: 'Huanggang', code: 'HB-HG' },
      { nameZh: '咸宁市', nameEn: 'Xianning', code: 'HB-XN' },
      { nameZh: '随州市', nameEn: 'Suizhou', code: 'HB-SZ' }
    ]
  },
  {
    nameZh: '湖南省',
    nameEn: 'Hunan Province',
    code: 'HN',
    order: 19,
    cities: [
      { nameZh: '长沙市', nameEn: 'Changsha', code: 'HN-CS' },
      { nameZh: '株洲市', nameEn: 'Zhuzhou', code: 'HN-ZZ' },
      { nameZh: '湘潭市', nameEn: 'Xiangtan', code: 'HN-XT' },
      { nameZh: '衡阳市', nameEn: 'Hengyang', code: 'HN-HY' },
      { nameZh: '邵阳市', nameEn: 'Shaoyang', code: 'HN-SY' },
      { nameZh: '岳阳市', nameEn: 'Yueyang', code: 'HN-YY' },
      { nameZh: '常德市', nameEn: 'Changde', code: 'HN-CD' },
      { nameZh: '张家界市', nameEn: 'Zhangjiajie', code: 'HN-ZJJ' },
      { nameZh: '益阳市', nameEn: 'Yiyang', code: 'HN-YY2' },
      { nameZh: '郴州市', nameEn: 'Chenzhou', code: 'HN-CZ' },
      { nameZh: '永州市', nameEn: 'Yongzhou', code: 'HN-YZ' },
      { nameZh: '怀化市', nameEn: 'Huaihua', code: 'HN-HH' },
      { nameZh: '娄底市', nameEn: 'Loudi', code: 'HN-LD' }
    ]
  },
  {
    nameZh: '广东省',
    nameEn: 'Guangdong Province',
    code: 'GD',
    order: 20,
    cities: [
      { nameZh: '广州市', nameEn: 'Guangzhou', code: 'GD-GZ' },
      { nameZh: '韶关市', nameEn: 'Shaoguan', code: 'GD-SG' },
      { nameZh: '深圳市', nameEn: 'Shenzhen', code: 'GD-SZ' },
      { nameZh: '珠海市', nameEn: 'Zhuhai', code: 'GD-ZH' },
      { nameZh: '汕头市', nameEn: 'Shantou', code: 'GD-ST' },
      { nameZh: '佛山市', nameEn: 'Foshan', code: 'GD-FS' },
      { nameZh: '江门市', nameEn: 'Jiangmen', code: 'GD-JM' },
      { nameZh: '湛江市', nameEn: 'Zhanjiang', code: 'GD-ZJ' },
      { nameZh: '茂名市', nameEn: 'Maoming', code: 'GD-MM' },
      { nameZh: '肇庆市', nameEn: 'Zhaoqing', code: 'GD-ZQ' },
      { nameZh: '惠州市', nameEn: 'Huizhou', code: 'GD-HZ' },
      { nameZh: '梅州市', nameEn: 'Meizhou', code: 'GD-MZ' },
      { nameZh: '汕尾市', nameEn: 'Shanwei', code: 'GD-SW' },
      { nameZh: '河源市', nameEn: 'Heyuan', code: 'GD-HY' },
      { nameZh: '阳江市', nameEn: 'Yangjiang', code: 'GD-YJ' },
      { nameZh: '清远市', nameEn: 'Qingyuan', code: 'GD-QY' },
      { nameZh: '东莞市', nameEn: 'Dongguan', code: 'GD-DG' },
      { nameZh: '中山市', nameEn: 'Zhongshan', code: 'GD-ZS' },
      { nameZh: '潮州市', nameEn: 'Chaozhou', code: 'GD-CZ' },
      { nameZh: '揭阳市', nameEn: 'Jieyang', code: 'GD-JY' },
      { nameZh: '云浮市', nameEn: 'Yunfu', code: 'GD-YF' }
    ]
  }
]

async function seedProvinces() {
  console.log('开始种子化省市数据...')

  try {
    // 清除现有数据
    await prisma.china_cities.deleteMany()
    await prisma.china_provinces.deleteMany()

    for (const provinceData of provincesData) {
      const { cities, ...province } = provinceData

      // 创建省份
      const createdProvince = await prisma.china_provinces.create({
        data: {
          id: nanoid(),
          nameZh: province.nameZh,
          nameEn: province.nameEn,
          code: province.code,
          order: province.order
        }
      })

      // 创建城市
      for (let i = 0; i < cities.length; i++) {
        const city = cities[i]
        await prisma.china_cities.create({
          data: {
            id: nanoid(),
            nameZh: city.nameZh,
            nameEn: city.nameEn,
            code: city.code,
            provinceId: createdProvince.id,
            order: i + 1
          }
        })
      }

      console.log(`✓ 已创建省份: ${province.nameZh} (${cities.length} 个城市)`)
    }

    console.log('✅ 省市数据种子化完成!')
  } catch (error) {
    console.error('❌ 种子化失败:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  seedProvinces()
}

export default seedProvinces
