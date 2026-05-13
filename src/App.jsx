import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Bounds, ContactShadows, Environment, Html, OrbitControls, useGLTF, useTexture } from '@react-three/drei';
import { BatteryCharging, BookOpen, Camera, Car, ChevronLeft, ChevronRight, Cuboid, Download, Gauge, ImagePlus, Leaf, MapPinned, ShieldCheck, Sparkles, UploadCloud, Wrench } from 'lucide-react';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

const MODEL_API_BASE = import.meta.env.VITE_MODEL_API_BASE || 'http://127.0.0.1:8787';
const GPT_REFERENCE_URL = '/assets/panda-tripo-reference.png';
const GPT_REFERENCE_NAME = 'panda-tripo-reference.png';
const CURATED_MODEL_URL = MODEL_API_BASE + '/api/3d/local-model/6aad369f-a18e-4179-9ab8-d5c2d6a89918.glb';
const CURATED_TASK_ID = '6aad369f-a18e-4179-9ab8-d5c2d6a89918';

const animals = [
  {
    id: 'PANDA-07', name: '大熊猫', latin: 'Ailuropoda melanoleuca', habitat: '四川高山竹林', rarity: '中国符号级物种', type: 'animal',
    modelUrl: CURATED_MODEL_URL, referenceUrl: GPT_REFERENCE_URL, referenceName: GPT_REFERENCE_NAME, taskId: CURATED_TASK_ID,
    palette: ['#f3eee4', '#101114', '#ef8c3d', '#147c82'], stats: { identity: 99, habitat: 86, risk: 62, recovery: 88 },
    conservation: '易危 VU', population: '野外约 1,900 只', diet: '竹子为主，也会少量取食其他植物',
    ecosystemRole: '通过活动路径和取食行为影响竹林更新，是山地森林健康的旗舰物种。',
    threat: '栖息地破碎化、竹林周期性退化、种群隔离。', action: '保护连续竹林廊道，减少道路和人类活动切割栖息地。',
    parts: [
      { id: 'diet', name: '竹食适应', tag: 'Diet', value: '低能量食物', position: [0.1, 0.38, 0.68], body: '大熊猫以竹子为主食，但消化效率不高，所以需要长时间取食和大面积健康竹林。' },
      { id: 'thumb', name: '伪拇指', tag: 'Adaptation', value: '抓握竹子', position: [-0.62, 0.06, 0.48], body: '大熊猫腕骨延伸形成类似拇指的结构，能帮助它稳定抓住竹秆和竹笋。' },
      { id: 'fur', name: '黑白体色', tag: 'Camouflage', value: '雪地与阴影', position: [0, 1.26, 0.4], body: '黑白分区既有视觉识别功能，也可能帮助它在雪地、岩石和竹林阴影间隐藏轮廓。' },
      { id: 'corridor', name: '竹林廊道', tag: 'Habitat', value: '连接种群', position: [0.9, 0.62, -0.16], body: '保护大熊猫不只是保护单块山林，关键是让不同小种群之间仍有迁移和基因交流通道。' },
    ],
    facts: ['大熊猫属于熊科，不是浣熊。', '竹食习性需要大面积健康竹林支撑。', '旗舰物种保护会连带保护同域的羚牛、小熊猫和大量鸟类。'],
  },
  {
    id: 'GOLD-31', name: '川金丝猴', latin: 'Rhinopithecus roxellana', habitat: '秦岭与川西山地', rarity: '中国特有灵长类', type: 'animal', modelUrl: MODEL_API_BASE + '/api/3d/local-model/3f4708f3-51d4-4046-b827-0b3b012c8047.glb', referenceUrl: '/assets/animal-gold-reference.png', referenceName: 'animal-gold-reference.png', taskId: '3f4708f3-51d4-4046-b827-0b3b012c8047',
    palette: ['#e7b35f', '#f4e8d1', '#587a92', '#252b30'], stats: { identity: 86, habitat: 78, risk: 75, recovery: 61 },
    conservation: '濒危 EN', population: '约 8,000-15,000 只', diet: '嫩叶、芽、果实、种子和地衣',
    ecosystemRole: '在高山森林中传播种子，也反映阔叶林与针阔混交林的完整性。',
    threat: '森林退化、栖息地分割、冬季食物压力。', action: '保护秦岭和川西高海拔森林，减少旅游开发对猴群活动线的干扰。',
    parts: [
      { id: 'face', name: '蓝色面部', tag: 'Identity', value: '物种识别', position: [0.12, 1.08, 0.52], body: '川金丝猴蓝色面部和上翘鼻孔非常醒目，是辨认这一中国特有灵长类的重要特征。' },
      { id: 'fur', name: '金色长毛', tag: 'Cold', value: '高山保温', position: [-0.34, 0.56, 0.34], body: '浓密金色长毛帮助它们适应秦岭、川西等寒冷高海拔森林环境。' },
      { id: 'tail', name: '长尾平衡', tag: 'Movement', value: '林冠移动', position: [0.9, 0.1, -0.38], body: '在树冠间跳跃和攀爬时，长尾有助于身体平衡，减少从高处跌落的风险。' },
      { id: 'forest', name: '森林更新', tag: 'Ecosystem', value: '种子传播', position: [-0.92, 0.82, -0.1], body: '取食果实和移动路线会帮助传播种子，健康猴群往往说明森林结构仍然比较完整。' },
    ],
    facts: ['金色毛发是适应寒冷高山环境的保温层。', '它们有复杂社会结构，常以小家庭单元组成大群。', '保护金丝猴等于保护高山森林的垂直生态带。'],
  },
  {
    id: 'IBIS-22', name: '朱鹮', latin: 'Nipponia nippon', habitat: '陕西汉中湿地', rarity: '东方宝石', type: 'animal', modelUrl: MODEL_API_BASE + '/api/3d/local-model/754f460f-1fd0-4ff4-baba-fb8e6c8a40ce.glb', referenceUrl: '/assets/animal-ibis-reference.png', referenceName: 'animal-ibis-reference.png', taskId: '754f460f-1fd0-4ff4-baba-fb8e6c8a40ce',
    palette: ['#fff6ee', '#e46d5d', '#22282c', '#84a7ad'], stats: { identity: 74, habitat: 82, risk: 72, recovery: 96 },
    conservation: '濒危 EN', population: '从 7 只恢复到数千只', diet: '泥鳅、小鱼、昆虫和水生无脊椎动物',
    ecosystemRole: '湿地水田系统的指示物种，说明浅水觅食地和低干扰繁殖地仍然存在。',
    threat: '湿地消失、农药污染、繁殖地干扰。', action: '保留浅水稻田和湿地缓冲带，控制农药使用，保护巢树。',
    parts: [
      { id: 'beak', name: '长弯喙', tag: 'Foraging', value: '浅水探食', position: [0.95, 0.62, 0.18], body: '朱鹮的长弯喙适合在浅水和泥地中探食小鱼、泥鳅、昆虫和无脊椎动物。' },
      { id: 'legs', name: '长腿涉水', tag: 'Wetland', value: '水田觅食', position: [0.0, -0.46, 0.22], body: '长腿让它能在浅水湿地和稻田中缓慢行走，寻找水生小动物。' },
      { id: 'plume', name: '冠羽', tag: 'Breeding', value: '繁殖展示', position: [0.66, 0.96, 0.02], body: '头部冠羽和繁殖期体色变化是朱鹮的重要识别特征，也与求偶展示有关。' },
      { id: 'monitor', name: '监测脚环', tag: 'Conservation', value: '种群追踪', position: [-0.18, -0.9, -0.1], body: '保护人员会通过环志、卫星追踪和栖息地监测了解朱鹮迁飞、繁殖和死亡风险。' },
    ],
    facts: ['朱鹮曾一度被认为野外灭绝。', '1981 年在陕西洋县重新发现 7 只野生个体。', '它的恢复是中国濒危鸟类保护的代表案例。'],
  },
  {
    id: 'GATOR-09', name: '扬子鳄', latin: 'Alligator sinensis', habitat: '长江下游湿地', rarity: '中国特有鳄类', type: 'animal', modelUrl: MODEL_API_BASE + '/api/3d/local-model/9ccd902e-0ce5-40e5-a396-9b16726e9ff1.glb', referenceUrl: '/assets/animal-gator-reference.png', referenceName: 'animal-gator-reference.png', taskId: '9ccd902e-0ce5-40e5-a396-9b16726e9ff1',
    palette: ['#425242', '#899066', '#1d211a', '#d4bd87'], stats: { identity: 58, habitat: 69, risk: 95, recovery: 55 },
    conservation: '极危 CR', population: '野外成熟个体仍很少', diet: '鱼、螺、甲壳类、小型脊椎动物',
    ecosystemRole: '湿地顶级小型捕食者，洞穴行为能改变微地形并为其他物种提供庇护。',
    threat: '湿地围垦、水系隔离、人鳄冲突。', action: '恢复长江下游湿地连通性，保留安静的越冬洞穴和繁殖水塘。',
    parts: [
      { id: 'armor', name: '骨质鳞甲', tag: 'Armor', value: '保护身体', position: [-0.18, 0.22, 0.12], body: '背部骨质鳞甲像天然护甲，能保护身体，也帮助识别鳄类坚硬的外形特征。' },
      { id: 'snout', name: '短宽吻部', tag: 'Feeding', value: '伏击捕食', position: [1.18, 0.02, 0.18], body: '扬子鳄吻部短而宽，适合伏击鱼、螺和小型水生动物，是湿地食物网的一环。' },
      { id: 'tail', name: '强壮尾部', tag: 'Swimming', value: '推进转向', position: [-1.44, -0.02, 0.04], body: '尾部是游泳时最重要的推进和转向结构，也能帮助它在水中突然加速。' },
      { id: 'burrow', name: '越冬洞穴', tag: 'Habitat', value: '低干扰湿地', position: [0.42, -0.66, -0.38], body: '扬子鳄会利用洞穴越冬和躲避干扰，所以保护安静水塘、岸坡和泥滩非常关键。' },
    ],
    facts: ['扬子鳄是世界上最濒危的鳄类之一。', '它体型远小于很多热带鳄鱼，性情相对隐蔽。', '保护核心是恢复低干扰湿地，而不是只做人工繁育。'],
  },
];

const cars = [
  {
    id: 'HYPER-01', name: '碳纤维赛道超跑', latin: 'Carbon Hypercar', rarity: '空气动力学旗舰', habitat: '低趴中置平台', type: 'car', variant: 'hyper', badge: 'AERO', modelUrl: MODEL_API_BASE + '/api/3d/local-model/d96d2513-af96-45c8-9d02-ce01a9bfeb64.glb', referenceUrl: '/assets/car-hyper-reference.png', referenceName: 'car-hyper-reference.png', taskId: 'd96d2513-af96-45c8-9d02-ce01a9bfeb64',
    palette: ['#f5f7f6', '#111317', '#ff4d2e', '#0aa6b5'], stats: { aero: 96, power: 92, chassis: 88, control: 84 },
    platform: '碳纤维单体壳 + 中置动力', performance: '高速下压力、轻量化、赛道稳定性',
    ecosystemRole: '这类车代表现代超跑的核心方向：车身不是只追求好看，而是把空气引导成抓地力。',
    action: '高速弯中，前唇、侧裙、底板和尾翼一起工作，让轮胎更稳定地压在地面上。',
    parts: [
      { id: 'aero', name: '主动尾翼', tag: 'Downforce', value: '高速压住后轴', position: [1.55, 0.68, 0], body: '尾翼通过角度变化在高速时制造下压力，刹车时也能变成空气制动面。' },
      { id: 'power', name: '中置动力舱', tag: 'Powertrain', value: '重心靠中', position: [-0.35, 0.58, 0], body: '发动机或电驱系统放在座舱后方，让前后配重更接近理想状态，转向响应更快。' },
      { id: 'brake', name: '碳陶刹车', tag: 'Brake', value: '抗热衰退', position: [0.9, -0.18, 0.78], body: '碳陶刹车盘更轻，连续重刹时热衰退更小，是高性能车的关键安全部件。' },
      { id: 'cockpit', name: '单体座舱', tag: 'Safety cell', value: '强度高且轻', position: [-0.45, 0.9, 0], body: '碳纤维座舱像一个硬壳保护乘员，同时降低车身重量，是超跑昂贵的重要原因。' },
    ],
    facts: ['下压力越大，高速弯越稳，但直线极速会被阻力拖慢。', '中置布局让车更灵敏，也更考验驾驶者。', '碳纤维贵，是因为材料和制造工艺都很复杂。'],
  },
  {
    id: 'EV-GT-88', name: '高性能电动 GT', latin: 'Electric Grand Tourer', rarity: '电驱时代代表', habitat: '滑板电池平台', type: 'car', variant: 'ev', badge: 'EV', modelUrl: MODEL_API_BASE + '/api/3d/local-model/132ce993-ec63-4ec4-a5e5-c6be29e7c0bb.glb', referenceUrl: '/assets/car-evgt-reference.png', referenceName: 'car-evgt-reference.png', taskId: '132ce993-ec63-4ec4-a5e5-c6be29e7c0bb',
    palette: ['#dfe8ed', '#111820', '#6de3ff', '#7f5af0'], stats: { aero: 82, power: 88, chassis: 91, control: 89 },
    platform: '低重心电池包 + 双电机四驱', performance: '瞬时扭矩、安静巡航、能量管理',
    ecosystemRole: '电动 GT 的帅不是声浪，而是低重心、干净线条和电机瞬间响应带来的未来感。',
    action: '电池、热管理和电控系统决定它能不能持续输出，而不是只看一次加速成绩。',
    parts: [
      { id: 'battery', name: '结构电池包', tag: 'Battery', value: '低重心底盘', position: [0, -0.35, 0], body: '大电池平铺在车底，降低重心，也能成为车身结构的一部分提升刚性。' },
      { id: 'motor', name: '前后电机', tag: 'Dual motor', value: '毫秒级扭矩分配', position: [1.25, -0.12, 0], body: '前后电机可以独立分配扭矩，让湿滑路面和弯中加速更可控。' },
      { id: 'thermal', name: '热管理回路', tag: 'Cooling', value: '稳定高输出', position: [-0.7, 0.62, 0.48], body: '电池和电机都怕温度失控，热管理决定连续加速和快充时的表现。' },
      { id: 'display', name: '数字座舱', tag: 'Interface', value: '驾驶信息中枢', position: [-0.15, 0.82, 0], body: '电动车的很多能力来自软件，数字座舱负责把能耗、辅助驾驶和车辆状态清楚呈现。' },
    ],
    facts: ['电动车快，不只是马力大，核心是电机扭矩响应极快。', '电池越低，车身侧倾通常越容易控制。', '热管理不好，性能会很快降额。'],
  },
  {
    id: 'RALLY-76', name: '经典拉力战车', latin: 'Group B Inspired Rally', rarity: '机械暴力美学', habitat: '短轴距四驱底盘', type: 'car', variant: 'rally', badge: 'AWD', modelUrl: MODEL_API_BASE + '/api/3d/local-model/28cea82d-c1b5-45fd-b6b1-5c705ba35260.glb', referenceUrl: '/assets/car-rally-reference.png', referenceName: 'car-rally-reference.png', taskId: '28cea82d-c1b5-45fd-b6b1-5c705ba35260',
    palette: ['#f4f0e8', '#101417', '#ffb000', '#d72638'], stats: { aero: 68, power: 86, chassis: 95, control: 93 },
    platform: '涡轮增压 + 机械四驱', performance: '烂路抓地、悬挂行程、漂移可控性',
    ecosystemRole: '拉力车的帅来自功能暴露：宽体、灯组、进气口和高行程悬挂都是为了在非铺装路面活下来。',
    action: '它不追求展厅里最干净的线条，而是让车手在砂石、雪地和泥地里尽可能快。',
    parts: [
      { id: 'turbo', name: '涡轮进气', tag: 'Turbo', value: '高海拔补气', position: [-0.35, 0.92, 0], body: '涡轮压缩空气提升进气量，让发动机在高转速和高海拔环境下仍有强输出。' },
      { id: 'suspension', name: '长行程悬挂', tag: 'Suspension', value: '吸收跳跃冲击', position: [0.9, -0.18, 0.8], body: '拉力悬挂要承受落地冲击和连续坑洼，行程比公路跑车长得多。' },
      { id: 'lights', name: '夜战灯组', tag: 'Lighting', value: '穿透夜间赛段', position: [1.82, 0.24, 0], body: '大灯阵列让车手在夜间和尘土里提前读路，这是速度和安全的前提。' },
      { id: 'diff', name: '中央差速器', tag: 'AWD', value: '四轮分配动力', position: [0.1, -0.2, 0], body: '中央差速器把动力分给前后轴，让车在低附着力路面仍能把动力传到地面。' },
    ],
    facts: ['拉力车的宽体不是装饰，是给悬挂和轮胎留空间。', '短轴距更灵活，但高速稳定更难调。', '四驱系统让车可以用油门帮助转向。'],
  },
  {
    id: 'ROVER-X4', name: '远征越野车', latin: 'Expedition 4x4', rarity: '硬核工具美学', habitat: '非承载式车架', type: 'car', variant: 'rover', badge: '4X4', modelUrl: MODEL_API_BASE + '/api/3d/local-model/9b6f40fb-8551-4d21-af42-0942f83fa4db.glb', referenceUrl: '/assets/car-rover-reference.png', referenceName: 'car-rover-reference.png', taskId: '9b6f40fb-8551-4d21-af42-0942f83fa4db',
    palette: ['#6f7a5c', '#171a16', '#d8b46a', '#f5f1e6'], stats: { aero: 42, power: 78, chassis: 94, control: 82 },
    platform: '梯形车架 + 低速四驱', performance: '通过性、可靠性、载荷能力',
    ecosystemRole: '越野车的代表性不在极速，而在离开铺装路之后仍能通过、修复、装载和保护乘员。',
    action: '高离地间隙、接近角、离去角、差速锁和车架强度决定它能不能走到目的地。',
    parts: [
      { id: 'frame', name: '梯形车架', tag: 'Ladder frame', value: '抗扭和载重', position: [0, -0.42, 0], body: '非承载式车架把车身和底盘分开，适合重载、拖拽和长期烂路使用。' },
      { id: 'diff-lock', name: '差速锁', tag: 'Traction', value: '单轮打滑仍前进', position: [0.95, -0.22, 0], body: '差速锁能让左右车轮保持同步输出，避免一个轮子空转时整车失去动力。' },
      { id: 'snorkel', name: '涉水喉', tag: 'Intake', value: '抬高进气口', position: [0.95, 0.92, -0.58], body: '涉水喉把进气口抬高，降低涉水时发动机吸入水的风险。' },
      { id: 'recovery', name: '绞盘和护杠', tag: 'Recovery', value: '自救与防护', position: [1.95, 0.02, 0], body: '绞盘用于脱困，护杠保护水箱和车头，是远征越野的实用装备。' },
    ],
    facts: ['越野车看似方正，是为了空间、视野和可修复性。', '低速四驱会放大扭矩，让车更容易慢速攀爬。', '好的越野车首先是可靠工具，其次才是造型。'],
  },
];

const cases = [
  {
    id: 'INSECT-03', name: '拟态飞行实验室', latin: 'Mimicry Flight Lab', rarity: '自然教育场景', habitat: '昆虫翅膀与飞行', type: 'case', variant: 'insect', badge: 'BIO', modelUrl: MODEL_API_BASE + '/api/3d/local-model/9db67071-26be-4bba-b935-a77587462d37.glb', referenceUrl: '/assets/case-insect-reference.png', referenceName: 'case-insect-reference.png', taskId: '9db67071-26be-4bba-b935-a77587462d37',
    palette: ['#d7ead2', '#172026', '#f2b84b', '#4e8d6f'], stats: { visual: 92, learning: 91, interaction: 86, demo: 88 },
    audience: '儿童自然课、昆虫科普、博物馆导览', expansion: '从蝴蝶扩展到竹节虫、螳螂、甲虫和拟态生态链',
    ecosystemRole: '昆虫翅膀非常适合把平面图变成 3D 教育模型：纹理、翅脉、颜色和飞行姿态都能被拆成可点击知识点。',
    action: '这个 demo 可以用来解释拟态、结构色、轻量化翅脉和昆虫飞行，把抽象的演化知识变成可探索的模型。',
    parts: [
      { id: 'wing-pattern', name: '翅膀纹理', tag: 'Mimicry', value: '伪装和威慑', position: [-1.05, 0.52, 0.24], body: '昆虫翅膀上的花纹可能像叶片、眼睛或枯枝，用来隐藏自己或吓退捕食者。' },
      { id: 'veins', name: '翅脉结构', tag: 'Lightweight', value: '轻而有支撑', position: [0.92, 0.6, 0.12], body: '翅脉像轻量化骨架，让薄薄的翅膀既能承受拍动，又不会增加太多重量。' },
      { id: 'scales', name: '鳞粉颜色', tag: 'Color', value: '微结构反光', position: [-0.56, 1.04, 0.18], body: '很多蝴蝶的颜色不只是色素，也来自微小结构对光的反射，所以角度变化时颜色会改变。' },
      { id: 'flight', name: '拍翼飞行', tag: 'Motion', value: '升力和转向', position: [0.2, -0.24, 0.42], body: '昆虫不是固定机翼飞行，而是通过快速拍翼和改变角度产生升力、转向和悬停。' },
    ],
    facts: ['适合讲拟态、结构色和飞行力学。', '3D 热点能把昆虫身体分成可探索的知识节点。', '可以扩展成一套儿童昆虫图鉴或自然博物馆展项。'],
  },
  {
    id: 'BRONZE-01', name: '青铜礼器数字展柜', latin: 'Bronze Ritual Vessel', rarity: '文化教育场景', habitat: '青铜器纹样与礼制', type: 'case', variant: 'bronze', badge: 'MUSEUM', modelUrl: MODEL_API_BASE + '/api/3d/local-model/d2d0a491-07c7-434a-9ac4-8f824484a380.glb', referenceUrl: '/assets/case-bronze-reference.png', referenceName: 'case-bronze-reference.png', taskId: 'd2d0a491-07c7-434a-9ac4-8f824484a380',
    palette: ['#8c7a48', '#1f241d', '#c9a14b', '#2f6f67'], stats: { visual: 84, learning: 95, interaction: 82, demo: 91 },
    audience: '博物馆导览、历史课、文物数字展览', expansion: '从青铜鼎扩展到尊、爵、簋、兵马俑和古建筑构件',
    ecosystemRole: '文物照片常常难以说明器型、纹样和工艺。3D 展柜可以让观众旋转文物，并点击纹样、铭文和结构理解背后的文化语境。',
    action: '这个 demo 的价值是把静态展品变成可讲解的数字文物：不只看造型，还能理解礼制、铭文、铸造和身份象征。',
    parts: [
      { id: 'taotie', name: '饕餮纹', tag: 'Ritual', value: '礼制和权力', position: [0, 0.46, 0.7], body: '饕餮纹不只是装饰，它常与祭祀、礼制和权力表达有关，是青铜礼器最有辨识度的纹样之一。' },
      { id: 'inscription', name: '铭文区域', tag: 'History', value: '记录事件', position: [-0.42, 0.86, -0.08], body: '部分青铜器内壁或器身有铭文，会记录族名、战争、赏赐、祭祀或铸造者信息。' },
      { id: 'casting', name: '范铸痕迹', tag: 'Craft', value: '分范合铸', position: [0.62, 0.12, 0.36], body: '很多青铜器不是雕出来的，而是用陶范分块铸造，再组合成复杂器型。' },
      { id: 'ears', name: '器耳与足', tag: 'Form', value: '形制等级', position: [0.92, 0.8, 0], body: '器耳和器足既影响搬运与稳定，也体现礼器形制。不同器型常对应不同用途和等级。' },
    ],
    facts: ['适合把文物照片升级成可互动数字展柜。', '观众可以从形状、纹样、铭文和工艺四条线理解文物。', '很适合博物馆、研学和历史课的轻量化互动内容。'],
  },
  {
    id: 'AERO-01', name: '超跑空气动力学教室', latin: 'Aero Downforce Studio', rarity: '工程科普场景', habitat: '尾翼、底板和气流', type: 'case', variant: 'aero', badge: 'AERO', modelUrl: MODEL_API_BASE + '/api/3d/local-model/358ffb71-4995-49d3-a08e-7ee8ac29dd86.glb', referenceUrl: '/assets/case-aero-reference.png', referenceName: 'case-aero-reference.png', taskId: '358ffb71-4995-49d3-a08e-7ee8ac29dd86',
    palette: ['#edf2f1', '#111317', '#e04833', '#247f8f'], stats: { visual: 89, learning: 87, interaction: 92, demo: 94 },
    audience: '汽车科普、工程教育、性能车产品展示', expansion: '从超跑扩展到 F1、无人机、飞机机翼和风洞实验',
    ecosystemRole: '空气动力学很抽象，但车身、前唇、底板、扩散器和尾翼都可以在 3D 模型上被直接点出来。',
    action: '这个 demo 可以解释为什么尾翼不是装饰，而是用空气制造下压力；也能展示产品页如何从外观展示升级到工程讲解。',
    parts: [
      { id: 'rear-wing', name: '主动尾翼', tag: 'Downforce', value: '压住后轴', position: [-1.62, 0.78, 0], body: '尾翼让高速气流产生向下的力，使后轮更稳定。角度变化时，它还可以帮助刹车或降低阻力。' },
      { id: 'front-splitter', name: '前唇', tag: 'Front grip', value: '稳住车头', position: [1.82, -0.02, 0], body: '前唇控制车头下方气流，减少车头抬升，让前轮在高速弯里更有抓地力。' },
      { id: 'diffuser', name: '扩散器', tag: 'Underbody', value: '管理车底气流', position: [-1.3, -0.28, 0.52], body: '扩散器让车底空气更顺畅地排出，帮助底盘产生稳定下压力。' },
      { id: 'airflow', name: '气流路径', tag: 'Flow', value: '阻力和效率', position: [0.2, 1.12, -0.22], body: '空气动力学不是单个部件工作，而是整车表面、车底和尾部一起管理气流。' },
    ],
    facts: ['适合讲下压力、阻力、底盘气流和高速稳定性。', '工程知识能从抽象公式变成可点击部件。', '也可以直接延伸到汽车电商、性能车介绍和工程课程。'],
  },
];

const collections = {
  animals: { id: 'animals', label: 'Animals', title: 'CHINA WILDLIFE FUTURE STORE', icon: Leaf, items: animals },
  cars: { id: 'cars', label: 'Cars', title: 'MACHINE PARTS FUTURE STORE', icon: Car, items: cars },
  cases: { id: 'cases', label: 'Cases', title: 'AI IMAGE TO 3D APPLICATION LAB', icon: Cuboid, items: cases },
};

const terminalStates = new Set(['success', 'succeeded', 'completed', 'complete', 'done', 'finish', 'finished']);
const failureStates = new Set(['failed', 'failure', 'error', 'canceled', 'cancelled']);
const animalModes = [
  { id: 'overview', label: 'Overview', icon: BookOpen },
  { id: 'habitat', label: 'Habitat', icon: MapPinned },
  { id: 'action', label: 'Action', icon: ShieldCheck },
];
const carModes = [
  { id: 'overview', label: 'Overview', icon: Gauge },
  { id: 'habitat', label: 'Parts', icon: Wrench },
  { id: 'action', label: 'Drive', icon: BatteryCharging },
];
const caseModes = [
  { id: 'overview', label: 'Scenario', icon: BookOpen },
  { id: 'habitat', label: 'Hotspot', icon: Wrench },
  { id: 'action', label: 'Value', icon: Sparkles },
];

function resolveModelUrl(url) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return `${MODEL_API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
}

function materialsFor(item) {
  const [primary, dark, accent, signal] = item.palette;
  return {
    primary: new THREE.MeshStandardMaterial({ color: primary, roughness: 0.62, metalness: item.type === 'car' ? 0.24 : 0.05 }),
    dark: new THREE.MeshStandardMaterial({ color: dark, roughness: 0.55, metalness: 0.12 }),
    accent: new THREE.MeshStandardMaterial({ color: accent, roughness: 0.45, metalness: 0.18 }),
    signal: new THREE.MeshStandardMaterial({ color: signal, roughness: 0.38, metalness: 0.22 }),
    glass: new THREE.MeshStandardMaterial({ color: '#d9f7ff', roughness: 0.12, metalness: 0.08, transparent: true, opacity: 0.66, side: THREE.DoubleSide }),
    tire: new THREE.MeshStandardMaterial({ color: '#111214', roughness: 0.76, metalness: 0.08 }),
    glow: new THREE.MeshStandardMaterial({ color: accent, roughness: 0.25, metalness: 0.28, emissive: new THREE.Color(accent), emissiveIntensity: 0.35 }),
  };
}

function ConceptPanda({ materials }) {
  return <>
    <mesh castShadow receiveShadow scale={[0.88, 1.18, 0.72]} position={[0, 0.36, 0]}><sphereGeometry args={[1, 54, 54]} /><primitive object={materials.primary} attach="material" /></mesh>
    <mesh castShadow scale={[0.72, 0.62, 0.58]} position={[0, 1.56, 0]}><sphereGeometry args={[1, 54, 54]} /><primitive object={materials.primary} attach="material" /></mesh>
    {[[-0.48, 2.02, -0.02], [0.48, 2.02, -0.02]].map((position) => <mesh key={position.join()} castShadow scale={[0.22, 0.25, 0.16]} position={position}><sphereGeometry args={[1, 32, 32]} /><primitive object={materials.dark} attach="material" /></mesh>)}
    {[[-0.28, 1.63, 0.54, -0.2], [0.28, 1.63, 0.54, 0.2]].map(([x, y, z, r]) => <mesh key={x} castShadow scale={[0.22, 0.32, 0.08]} rotation={[0.05, r, r]} position={[x, y, z]}><sphereGeometry args={[1, 32, 32]} /><primitive object={materials.dark} attach="material" /></mesh>)}
    <mesh castShadow scale={[0.16, 0.1, 0.08]} position={[0, 1.5, 0.68]}><sphereGeometry args={[1, 24, 24]} /><primitive object={materials.dark} attach="material" /></mesh>
    {[[-0.82, 0.24, 0.03, 0.52], [0.82, 0.24, 0.03, -0.52]].map(([x, y, z, r]) => <mesh key={x} castShadow rotation={[0.18, 0, r]} scale={[0.23, 0.66, 0.23]} position={[x, y, z]}><capsuleGeometry args={[0.5, 0.58, 24, 32]} /><primitive object={materials.dark} attach="material" /></mesh>)}
    {[[-0.36, -0.62, 0.04, 0.06], [0.36, -0.62, 0.04, -0.06]].map(([x, y, z, r]) => <mesh key={x} castShadow rotation={[0, 0, r]} scale={[0.32, 0.46, 0.24]} position={[x, y, z]}><capsuleGeometry args={[0.46, 0.38, 24, 32]} /><primitive object={materials.dark} attach="material" /></mesh>)}
    <mesh castShadow position={[0, 0.5, 0.75]} scale={[0.24, 0.28, 0.08]}><boxGeometry args={[1, 1, 1]} /><primitive object={materials.signal} attach="material" /></mesh>
    <mesh castShadow position={[0, 0.5, 0.82]} scale={[0.1, 0.1, 0.02]}><circleGeometry args={[1, 32]} /><primitive object={materials.accent} attach="material" /></mesh>
  </>;
}

function ConceptMonkey({ materials }) {
  return <>
    <mesh castShadow scale={[0.72, 1.05, 0.55]} position={[0, 0.18, 0]}><sphereGeometry args={[1, 48, 48]} /><primitive object={materials.primary} attach="material" /></mesh>
    <mesh castShadow scale={[0.58, 0.62, 0.5]} position={[0, 1.3, 0.1]}><sphereGeometry args={[1, 48, 48]} /><primitive object={materials.primary} attach="material" /></mesh>
    <mesh castShadow scale={[0.32, 0.24, 0.12]} position={[0, 1.22, 0.55]}><sphereGeometry args={[1, 32, 32]} /><primitive object={materials.dark} attach="material" /></mesh>
    {[[-0.44, 1.33, 0.45], [0.44, 1.33, 0.45]].map((position) => <mesh key={position.join()} castShadow scale={[0.1, 0.1, 0.04]} position={position}><sphereGeometry args={[1, 18, 18]} /><primitive object={materials.dark} attach="material" /></mesh>)}
    {[[-0.78, 0.28, 0.1, 0.45], [0.78, 0.28, 0.1, -0.45]].map(([x, y, z, r]) => <mesh key={x} castShadow rotation={[0.1, 0, r]} scale={[0.18, 0.7, 0.18]} position={[x, y, z]}><capsuleGeometry args={[0.5, 0.52, 20, 28]} /><primitive object={materials.dark} attach="material" /></mesh>)}
    {[[-0.34, -0.72, 0.04], [0.34, -0.72, 0.04]].map((position) => <mesh key={position.join()} castShadow scale={[0.22, 0.56, 0.2]} position={position}><capsuleGeometry args={[0.48, 0.5, 20, 28]} /><primitive object={materials.signal} attach="material" /></mesh>)}
    <mesh castShadow rotation={[0.8, 0.1, -0.7]} position={[0.75, 0.28, -0.28]} scale={[0.12, 0.92, 0.12]}><torusGeometry args={[0.55, 0.09, 16, 72]} /><primitive object={materials.primary} attach="material" /></mesh>
  </>;
}

function ConceptIbis({ materials }) {
  return <>
    <mesh castShadow scale={[0.92, 0.42, 0.48]} position={[0, 0.25, 0]}><sphereGeometry args={[1, 48, 48]} /><primitive object={materials.primary} attach="material" /></mesh>
    <mesh castShadow scale={[0.34, 0.34, 0.28]} position={[0.72, 0.72, 0.06]}><sphereGeometry args={[1, 36, 36]} /><primitive object={materials.primary} attach="material" /></mesh>
    <mesh castShadow rotation={[0, 0, -0.5]} position={[1.2, 0.68, 0.08]} scale={[0.48, 0.05, 0.05]}><coneGeometry args={[0.24, 1, 24]} /><primitive object={materials.dark} attach="material" /></mesh>
    <mesh castShadow rotation={[0.12, 0.1, -0.25]} position={[-0.15, 0.25, 0.02]} scale={[1.05, 0.08, 0.36]}><capsuleGeometry args={[0.35, 1.8, 16, 32]} /><primitive object={materials.glass} attach="material" /></mesh>
    {[[-0.22, -0.52, 0.12], [0.22, -0.52, -0.12]].map((position) => <mesh key={position.join()} castShadow scale={[0.045, 0.7, 0.045]} position={position}><capsuleGeometry args={[0.5, 0.7, 12, 16]} /><primitive object={materials.accent} attach="material" /></mesh>)}
    {[[-0.22, -1.08, 0.22], [0.22, -1.08, -0.02]].map((position) => <mesh key={position.join()} castShadow rotation={[0, 0, 1.2]} scale={[0.2, 0.035, 0.035]} position={position}><capsuleGeometry args={[0.5, 0.5, 12, 16]} /><primitive object={materials.accent} attach="material" /></mesh>)}
  </>;
}

function ConceptGator({ materials }) {
  return <>
    <mesh castShadow scale={[1.65, 0.34, 0.44]} position={[0, -0.15, 0]}><capsuleGeometry args={[0.6, 1.45, 24, 40]} /><primitive object={materials.primary} attach="material" /></mesh>
    <mesh castShadow scale={[0.72, 0.22, 0.36]} position={[1.3, -0.08, 0]}><capsuleGeometry args={[0.48, 0.75, 20, 32]} /><primitive object={materials.primary} attach="material" /></mesh>
    <mesh castShadow rotation={[0, 0, Math.PI / 2]} scale={[0.18, 1.28, 0.18]} position={[-1.8, -0.12, 0]}><coneGeometry args={[0.45, 1.7, 32]} /><primitive object={materials.dark} attach="material" /></mesh>
    {[[-0.72, -0.48, 0.42, 0.7], [0.72, -0.48, 0.42, -0.7], [-0.72, -0.48, -0.42, 2.35], [0.72, -0.48, -0.42, -2.35]].map(([x, y, z, r]) => <mesh key={`${x}-${z}`} castShadow rotation={[0, 0, r]} scale={[0.12, 0.5, 0.12]} position={[x, y, z]}><capsuleGeometry args={[0.45, 0.45, 12, 20]} /><primitive object={materials.dark} attach="material" /></mesh>)}
    {[0.8, 0.35, -0.1, -0.55].map((x) => <mesh key={x} castShadow position={[x, 0.18, 0]} scale={[0.08, 0.16, 0.5]}><coneGeometry args={[1, 1, 4]} /><primitive object={materials.accent} attach="material" /></mesh>)}
  </>;
}

function AnimalConcept({ item, modelRef }) {
  const groupRef = useRef();
  const materials = useMemo(() => materialsFor(item), [item]);
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.32) * 0.14;
    groupRef.current.position.y = Math.sin(clock.getElapsedTime() * 1.05) * 0.035;
  });
  const conceptScale = item.id === 'GOLD-31' ? 0.58 : item.id === 'GATOR-09' ? 0.7 : item.id === 'IBIS-22' ? 0.78 : 0.86;
  return <group ref={(node) => { groupRef.current = node; modelRef.current = node; }} position={[0, -0.1, 0]} scale={conceptScale}>
    {item.id === 'GOLD-31' && <ConceptMonkey materials={materials} />}
    {item.id === 'IBIS-22' && <ConceptIbis materials={materials} />}
    {item.id === 'GATOR-09' && <ConceptGator materials={materials} />}
    {item.id === 'PANDA-07' && <ConceptPanda materials={materials} />}
    <mesh position={[0, -1.08, 0]} rotation={[-Math.PI / 2, 0, 0]}><torusGeometry args={[1.35, 0.014, 12, 96]} /><primitive object={materials.accent} attach="material" /></mesh>
    <mesh position={[0, -1.06, 0]} rotation={[-Math.PI / 2, 0, 0]}><torusGeometry args={[1.68, 0.01, 12, 96]} /><primitive object={materials.glass} attach="material" /></mesh>
  </group>;
}

function PartHotspot({ part, active, onSelect }) {
  return <Html position={part.position} center distanceFactor={5.8} zIndexRange={[20, 0]}>
    <button type="button" className={active ? 'part-hotspot active' : 'part-hotspot'} onClick={(event) => { event.stopPropagation(); onSelect(part.id); }}>
      <span>{part.name}</span>
    </button>
  </Html>;
}

function Wheel({ position, radius = 0.32, materials }) {
  return <group position={position} rotation={[Math.PI / 2, 0, 0]}>
    <mesh castShadow><cylinderGeometry args={[radius, radius, 0.22, 48]} /><primitive object={materials.tire} attach="material" /></mesh>
    <mesh position={[0, 0.12, 0]}><cylinderGeometry args={[radius * 0.52, radius * 0.52, 0.025, 32]} /><primitive object={materials.accent} attach="material" /></mesh>
  </group>;
}

function createCarBodyGeometry(variant) {
  const profiles = {
    hyper: [[-2.05, -0.25], [-1.48, -0.36], [1.45, -0.33], [1.95, -0.12], [1.55, 0.06], [0.42, 0.18], [0.05, 0.58], [-0.78, 0.64], [-1.26, 0.12]],
    ev: [[-1.98, -0.26], [-1.5, -0.34], [1.58, -0.3], [1.92, -0.08], [1.22, 0.16], [0.42, 0.48], [-0.58, 0.54], [-1.28, 0.08]],
    rally: [[-1.92, -0.3], [-1.48, -0.38], [1.62, -0.34], [1.92, -0.04], [1.34, 0.2], [0.35, 0.36], [-0.46, 0.58], [-1.16, 0.32], [-1.48, 0.02]],
    rover: [[-1.92, -0.33], [-1.68, -0.42], [1.65, -0.42], [1.92, -0.2], [1.66, 0.42], [0.82, 0.68], [-0.88, 0.68], [-1.72, 0.36]],
  };
  const points = profiles[variant] || profiles.hyper;
  const shape = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)));
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: variant === 'rover' ? 1.42 : 1.22, bevelEnabled: true, bevelSegments: 3, bevelSize: 0.045, bevelThickness: 0.045 });
  geometry.translate(0, 0, variant === 'rover' ? -0.71 : -0.61);
  geometry.computeVertexNormals();
  return geometry;
}

function CarConcept({ item, selectedPartId, onPartSelect, modelRef }) {
  const groupRef = useRef();
  const materials = useMemo(() => materialsFor(item), [item]);
  const bodyGeometry = useMemo(() => createCarBodyGeometry(item.variant), [item.variant]);
  const activePart = item.parts.find((part) => part.id === selectedPartId) || item.parts[0];
  const isHyper = item.variant === 'hyper';
  const isEv = item.variant === 'ev';
  const isRally = item.variant === 'rally';
  const isRover = item.variant === 'rover';
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = -0.42 + Math.sin(clock.getElapsedTime() * 0.18) * 0.16;
    groupRef.current.position.y = Math.sin(clock.getElapsedTime() * 0.8) * 0.018;
  });
  return <group ref={(node) => { groupRef.current = node; modelRef.current = node; }} position={[0, -0.25, 0]} scale={isRover ? 0.9 : 0.96}>
    <group>
      <mesh castShadow receiveShadow geometry={bodyGeometry}>
        <primitive object={materials.primary} attach="material" />
      </mesh>
      <mesh castShadow position={[isHyper ? -0.25 : -0.15, isRover ? 0.45 : 0.36, 0]} scale={[isRover ? 0.7 : 0.62, isRover ? 0.34 : 0.25, isRover ? 0.72 : 0.56]}>
        <boxGeometry args={[1, 1, 1]} /><primitive object={materials.glass} attach="material" />
      </mesh>
      <mesh castShadow position={[1.42, isRover ? 0.06 : -0.04, 0]} scale={[0.58, 0.035, isRover ? 0.82 : 0.72]}>
        <boxGeometry args={[1, 1, 1]} /><primitive object={materials.accent} attach="material" />
      </mesh>
      <mesh castShadow position={[-1.42, isRover ? 0.36 : 0.18, 0]} scale={[0.48, 0.035, isRover ? 0.84 : 0.7]}>
        <boxGeometry args={[1, 1, 1]} /><primitive object={materials.dark} attach="material" />
      </mesh>
      {isHyper && <>
        <mesh castShadow position={[-1.65, 0.43, 0]} scale={[0.72, 0.045, 0.98]}><boxGeometry args={[1, 1, 1]} /><primitive object={materials.accent} attach="material" /></mesh>
        <mesh castShadow position={[1.68, -0.14, 0]} scale={[0.32, 0.045, 0.95]}><boxGeometry args={[1, 1, 1]} /><primitive object={materials.accent} attach="material" /></mesh>
      </>}
      {isEv && <>
        <mesh castShadow position={[0, -0.28, 0]} scale={[1.65, 0.08, 0.68]}><boxGeometry args={[1, 1, 1]} /><primitive object={materials.signal} attach="material" /></mesh>
        <mesh castShadow position={[1.7, 0.08, 0]} scale={[0.14, 0.04, 0.5]}><boxGeometry args={[1, 1, 1]} /><primitive object={materials.glow} attach="material" /></mesh>
      </>}
      {isRally && <>
        <mesh castShadow position={[1.72, 0.22, 0]} scale={[0.12, 0.16, 0.5]}><boxGeometry args={[1, 1, 1]} /><primitive object={materials.glow} attach="material" /></mesh>
        <mesh castShadow position={[-0.26, 0.72, 0]} scale={[0.38, 0.1, 0.28]}><boxGeometry args={[1, 1, 1]} /><primitive object={materials.dark} attach="material" /></mesh>
        <mesh castShadow position={[-1.62, 0.44, 0]} scale={[0.56, 0.04, 0.9]}><boxGeometry args={[1, 1, 1]} /><primitive object={materials.accent} attach="material" /></mesh>
      </>}
      {isRover && <>
        <mesh castShadow position={[0.92, 0.86, -0.62]} scale={[0.08, 0.82, 0.08]}><cylinderGeometry args={[1, 1, 1, 16]} /><primitive object={materials.dark} attach="material" /></mesh>
        <mesh castShadow position={[-0.25, 0.96, 0]} scale={[1.05, 0.07, 0.72]}><boxGeometry args={[1, 1, 1]} /><primitive object={materials.dark} attach="material" /></mesh>
        <mesh castShadow position={[1.82, 0.04, 0]} scale={[0.16, 0.18, 0.86]}><boxGeometry args={[1, 1, 1]} /><primitive object={materials.accent} attach="material" /></mesh>
      </>}
      {[[-1.1, -0.35, 0.7], [1.1, -0.35, 0.7], [-1.1, -0.35, -0.7], [1.1, -0.35, -0.7]].map((position) => <Wheel key={position.join()} position={position} radius={isRover || isRally ? 0.36 : 0.3} materials={materials} />)}
      <mesh position={[0, -0.55, 0]} rotation={[-Math.PI / 2, 0, 0]}><torusGeometry args={[1.9, 0.012, 12, 110]} /><primitive object={materials.accent} attach="material" /></mesh>
      <mesh position={[0, -0.53, 0]} rotation={[-Math.PI / 2, 0, 0]}><torusGeometry args={[2.32, 0.008, 12, 110]} /><primitive object={materials.glass} attach="material" /></mesh>
    </group>
    {item.parts.map((part) => <PartHotspot key={part.id} part={part} active={part.id === activePart.id} onSelect={onPartSelect} />)}
    {activePart && <mesh position={activePart.position} scale={[0.075, 0.075, 0.075]}><sphereGeometry args={[1, 24, 24]} /><primitive object={materials.glow} attach="material" /></mesh>}
  </group>;
}

function ConceptInsectCase({ materials }) {
  return <>
    <mesh castShadow rotation={[Math.PI / 2, 0, 0]} position={[0, 0.22, 0]} scale={[0.16, 1.18, 0.16]}><capsuleGeometry args={[0.55, 0.9, 20, 32]} /><primitive object={materials.dark} attach="material" /></mesh>
    <mesh castShadow position={[0, 0.98, 0]} scale={[0.24, 0.2, 0.2]}><sphereGeometry args={[1, 32, 32]} /><primitive object={materials.dark} attach="material" /></mesh>
    {[[-0.72, 0.48, 0.02, 0.4], [0.72, 0.48, 0.02, -0.4], [-0.58, -0.26, -0.02, -0.34], [0.58, -0.26, -0.02, 0.34]].map(([x, y, z, r]) => <mesh key={`${x}-${y}`} castShadow rotation={[0.18, 0, r]} position={[x, y, z]} scale={[0.7, 0.08, 0.48]}><sphereGeometry args={[1, 42, 42]} /><primitive object={materials.glass} attach="material" /></mesh>)}
    {[[-0.86, 0.58, 0.09], [0.86, 0.58, 0.09], [-0.6, -0.18, 0.08], [0.6, -0.18, 0.08]].map((position) => <mesh key={position.join()} castShadow position={position} scale={[0.08, 0.08, 0.08]}><sphereGeometry args={[1, 20, 20]} /><primitive object={materials.accent} attach="material" /></mesh>)}
    {[[-0.42, 0.38, 0.12, -0.8], [0.42, 0.38, 0.12, 0.8], [-0.36, -0.22, 0.1, 0.95], [0.36, -0.22, 0.1, -0.95]].map(([x, y, z, r]) => <mesh key={`${x}-${r}`} castShadow rotation={[0, 0, r]} position={[x, y, z]} scale={[0.04, 0.52, 0.04]}><capsuleGeometry args={[0.45, 0.45, 12, 18]} /><primitive object={materials.signal} attach="material" /></mesh>)}
    {[[-0.18, 1.18, 0, -0.45], [0.18, 1.18, 0, 0.45]].map(([x, y, z, r]) => <mesh key={x} rotation={[0.2, 0, r]} position={[x, y, z]} scale={[0.018, 0.42, 0.018]}><capsuleGeometry args={[0.5, 0.6, 8, 12]} /><primitive object={materials.accent} attach="material" /></mesh>)}
  </>;
}

function ConceptBronzeCase({ materials }) {
  return <>
    <mesh castShadow receiveShadow position={[0, 0.22, 0]} scale={[0.9, 0.86, 0.9]}><cylinderGeometry args={[0.72, 0.9, 1.15, 8, 1, false]} /><primitive object={materials.primary} attach="material" /></mesh>
    <mesh castShadow position={[0, 0.86, 0]} scale={[1.02, 0.1, 1.02]}><torusGeometry args={[0.72, 0.08, 18, 8]} /><primitive object={materials.accent} attach="material" /></mesh>
    <mesh castShadow position={[0, 0.46, 0.72]} scale={[0.56, 0.22, 0.04]}><boxGeometry args={[1, 1, 1]} /><primitive object={materials.dark} attach="material" /></mesh>
    {[[-0.26, 0.46, 0.78], [0.26, 0.46, 0.78]].map((position) => <mesh key={position.join()} castShadow position={position} scale={[0.1, 0.1, 0.025]}><sphereGeometry args={[1, 20, 20]} /><primitive object={materials.accent} attach="material" /></mesh>)}
    {[[-0.94, 0.66, 0], [0.94, 0.66, 0]].map((position) => <mesh key={position.join()} castShadow rotation={[Math.PI / 2, 0, 0]} position={position} scale={[0.3, 0.09, 0.3]}><torusGeometry args={[0.75, 0.12, 16, 36]} /><primitive object={materials.primary} attach="material" /></mesh>)}
    {[[-0.48, -0.55, 0.48], [0.48, -0.55, 0.48], [-0.48, -0.55, -0.48], [0.48, -0.55, -0.48]].map((position) => <mesh key={position.join()} castShadow position={position} scale={[0.1, 0.56, 0.1]}><cylinderGeometry args={[0.55, 0.42, 1, 12]} /><primitive object={materials.dark} attach="material" /></mesh>)}
    {[0, 0.32, -0.32].map((y) => <mesh key={y} position={[0, y, 0.77]} scale={[0.8, 0.025, 0.018]}><boxGeometry args={[1, 1, 1]} /><primitive object={materials.signal} attach="material" /></mesh>)}
  </>;
}

function ConceptAeroCase({ materials }) {
  const bodyGeometry = useMemo(() => createCarBodyGeometry('hyper'), []);
  return <>
    <mesh castShadow receiveShadow geometry={bodyGeometry} scale={[0.95, 0.95, 0.95]}><primitive object={materials.primary} attach="material" /></mesh>
    <mesh castShadow position={[-0.18, 0.38, 0]} scale={[0.58, 0.22, 0.54]}><boxGeometry args={[1, 1, 1]} /><primitive object={materials.glass} attach="material" /></mesh>
    <mesh castShadow position={[-1.62, 0.58, 0]} scale={[0.68, 0.04, 0.95]}><boxGeometry args={[1, 1, 1]} /><primitive object={materials.accent} attach="material" /></mesh>
    {[[-1.82, 0.34, -0.42], [-1.82, 0.34, 0.42]].map((position) => <mesh key={position.join()} castShadow position={position} scale={[0.05, 0.32, 0.05]}><boxGeometry args={[1, 1, 1]} /><primitive object={materials.dark} attach="material" /></mesh>)}
    <mesh castShadow position={[1.72, -0.12, 0]} scale={[0.42, 0.035, 0.95]}><boxGeometry args={[1, 1, 1]} /><primitive object={materials.accent} attach="material" /></mesh>
    <mesh castShadow position={[-1.36, -0.32, 0.54]} rotation={[0, 0, -0.25]} scale={[0.52, 0.05, 0.08]}><boxGeometry args={[1, 1, 1]} /><primitive object={materials.signal} attach="material" /></mesh>
    {[[-1.1, -0.35, 0.7], [1.1, -0.35, 0.7], [-1.1, -0.35, -0.7], [1.1, -0.35, -0.7]].map((position) => <Wheel key={position.join()} position={position} radius={0.3} materials={materials} />)}
    {[0.25, 0.52, 0.79].map((z, index) => <mesh key={z} rotation={[Math.PI / 2, 0, 0]} position={[0.24 + index * 0.2, 1.08 + index * 0.1, z - 0.55]} scale={[0.72, 0.012, 0.72]}><torusGeometry args={[1.08, 0.018, 12, 72, Math.PI * 1.05]} /><primitive object={materials.glow} attach="material" /></mesh>)}
  </>;
}

function CaseConcept({ item, selectedPartId, onPartSelect, modelRef }) {
  const groupRef = useRef();
  const materials = useMemo(() => materialsFor(item), [item]);
  const activePart = item.parts.find((part) => part.id === selectedPartId) || item.parts[0];
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = -0.18 + Math.sin(clock.getElapsedTime() * 0.2) * 0.12;
    groupRef.current.position.y = Math.sin(clock.getElapsedTime() * 0.85) * 0.02;
  });
  return <group ref={(node) => { groupRef.current = node; modelRef.current = node; }} position={[0, item.variant === 'aero' ? -0.25 : -0.05, 0]} scale={item.variant === 'bronze' ? 1.1 : item.variant === 'insect' ? 1.08 : 0.95}>
    {item.variant === 'insect' && <ConceptInsectCase materials={materials} />}
    {item.variant === 'bronze' && <ConceptBronzeCase materials={materials} />}
    {item.variant === 'aero' && <ConceptAeroCase materials={materials} />}
    <mesh position={[0, -1.08, 0]} rotation={[-Math.PI / 2, 0, 0]}><torusGeometry args={[1.95, 0.012, 12, 110]} /><primitive object={materials.accent} attach="material" /></mesh>
    <mesh position={[0, -1.06, 0]} rotation={[-Math.PI / 2, 0, 0]}><torusGeometry args={[2.32, 0.008, 12, 110]} /><primitive object={materials.glass} attach="material" /></mesh>
    {item.parts.map((part) => <PartHotspot key={part.id} part={part} active={part.id === activePart.id} onSelect={onPartSelect} />)}
    {activePart && <mesh position={activePart.position} scale={[0.075, 0.075, 0.075]}><sphereGeometry args={[1, 24, 24]} /><primitive object={materials.glow} attach="material" /></mesh>}
  </group>;
}

function UploadedReference({ imageUrl }) {
  const texture = useTexture(imageUrl);
  return <mesh position={[-2.15, 0.8, -1.05]} rotation={[0, 0.36, 0]} scale={[0.78, 0.98, 1]}><planeGeometry args={[1.25, 1.5]} /><meshBasicMaterial map={texture} transparent opacity={0.78} /></mesh>;
}

function GeneratedModel({ modelUrl, modelRef, isCar }) {
  const { scene } = useGLTF(modelUrl);
  const groupRef = useRef();
  const normalized = useMemo(() => {
    const next = scene.clone(true);
    next.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    const box = new THREE.Box3().setFromObject(next);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    next.position.sub(center);
    const maxDimension = Math.max(size.x, size.y, size.z, 1);
    return { object: next, scale: 2.85 / maxDimension };
  }, [scene]);
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = (isCar ? -0.35 : -Math.PI / 2) + Math.sin(clock.getElapsedTime() * 0.24) * 0.1;
  });
  return <group ref={(node) => { groupRef.current = node; modelRef.current = node; }} position={[0, 0.08, 0]}><primitive object={normalized.object} scale={normalized.scale} /></group>;
}

function Scene({ item, isCar, isCase, referenceUrl, generatedModelUrl, modelRef, proofMode, selectedPartId, onPartSelect }) {
  return <>
    <color attach="background" args={[isCar ? '#f2f3f1' : isCase ? '#f4f3ee' : '#f5f6f3']} />
    <ambientLight intensity={0.82} />
    <directionalLight castShadow position={[3.5, 4.4, 3]} intensity={1.3} shadow-mapSize={[2048, 2048]} />
    <spotLight position={[-3, 4, 2]} angle={0.4} penumbra={0.6} intensity={0.78} color={item.palette[2]} />
    <Bounds fit clip observe margin={generatedModelUrl ? 0.95 : isCar || isCase ? 1.35 : 1.1}>
      {generatedModelUrl ? <GeneratedModel modelUrl={generatedModelUrl} modelRef={modelRef} isCar={isCar} /> : isCar ? <CarConcept item={item} selectedPartId={selectedPartId} onPartSelect={onPartSelect} modelRef={modelRef} /> : isCase ? <CaseConcept item={item} selectedPartId={selectedPartId} onPartSelect={onPartSelect} modelRef={modelRef} /> : <AnimalConcept item={item} modelRef={modelRef} />}
      {referenceUrl && !generatedModelUrl && <Suspense fallback={null}><UploadedReference imageUrl={referenceUrl} /></Suspense>}
    </Bounds>
    {generatedModelUrl && item.parts?.map((part) => <PartHotspot key={part.id} part={part} active={part.id === selectedPartId} onSelect={onPartSelect} />)}
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.18, 0]}><circleGeometry args={[3.8, 96]} /><meshStandardMaterial color={isCar ? '#e5e5df' : isCase ? '#e8e2d5' : '#e9e5dc'} roughness={0.74} /></mesh>
    <gridHelper args={[7, 18, item.palette[2], '#dfe3dc']} position={[0, -1.16, 0]} visible={proofMode} />
    <ContactShadows opacity={0.34} scale={6} blur={2.4} far={3.8} position={[0, -1.15, 0]} />
    <Environment preset="city" />
    <OrbitControls makeDefault enablePan={false} minDistance={2.2} maxDistance={6.4} target={[0, 0.28, 0]} />
  </>;
}

function InsightCard({ item, mode, isCar, isCase, selectedPart }) {
  const animalCopy = {
    overview: { title: '物种知识', icon: BookOpen, body: item.ecosystemRole, label: '食性', value: item.diet },
    habitat: { title: selectedPart?.name || '栖息地', icon: selectedPart ? Leaf : MapPinned, body: selectedPart?.body || item.threat, label: selectedPart?.tag || '核心区域', value: selectedPart?.value || item.habitat },
    action: { title: '保护行动', icon: ShieldCheck, body: item.action, label: '保护状态', value: item.conservation },
  };
  const carCopy = {
    overview: { title: '设计定位', icon: Gauge, body: item.ecosystemRole, label: '平台架构', value: item.platform },
    habitat: { title: selectedPart?.name || '部件解析', icon: Wrench, body: selectedPart?.body || item.ecosystemRole, label: selectedPart?.tag || 'System', value: selectedPart?.value || item.platform },
    action: { title: '驾驶性格', icon: BatteryCharging, body: item.action, label: '性能侧重点', value: item.performance },
  };
  const caseCopy = {
    overview: { title: '应用场景', icon: BookOpen, body: item.ecosystemRole, label: '适合人群', value: item.audience },
    habitat: { title: selectedPart?.name || '交互热点', icon: Wrench, body: selectedPart?.body || item.ecosystemRole, label: selectedPart?.tag || 'Knowledge', value: selectedPart?.value || item.habitat },
    action: { title: '扩展价值', icon: Sparkles, body: item.action, label: '可扩展方向', value: item.expansion },
  };
  const copy = (isCar ? carCopy : isCase ? caseCopy : animalCopy)[mode];
  const Icon = copy.icon;
  return <div className="edu-card"><div className="edu-card-title"><Icon size={18} /><strong>{copy.title}</strong></div><p>{copy.body}</p><div className="edu-meta"><span>{copy.label}</span><b>{copy.value}</b></div></div>;
}

function App() {
  const [collectionId, setCollectionId] = useState('animals');
  const [selectedIds, setSelectedIds] = useState({ animals: animals[0].id, cars: cars[0].id });
  const collection = collections[collectionId];
  const items = collection.items;
  const selected = items.find((item) => item.id === selectedIds[collectionId]) || items[0];
  const isCar = selected.type === 'car';
  const isCase = selected.type === 'case';
  const [mode, setMode] = useState('overview');
  const [selectedPartId, setSelectedPartId] = useState(selected.parts?.[0]?.id || '');
  const selectedPart = selected.parts?.find((part) => part.id === selectedPartId) || selected.parts?.[0] || null;
  const modes = isCar ? carModes : isCase ? caseModes : animalModes;
  const [referenceUrl, setReferenceUrl] = useState(selected.referenceUrl || '');
  const [referenceDataUrl, setReferenceDataUrl] = useState('');
  const [referenceName, setReferenceName] = useState(selected.referenceName || '');
  const [generatedModels, setGeneratedModels] = useState({ [animals[0].id]: CURATED_MODEL_URL });
  const [generatedModelUrl, setGeneratedModelUrl] = useState(selected.modelUrl || '');
  const [proofMode, setProofMode] = useState(false);
  const [generation, setGeneration] = useState({ status: 'success', progress: 100, taskId: CURATED_TASK_ID, message: 'GLB model ready' });
  const modelRef = useRef();

  useEffect(() => {
    const existingModel = generatedModels[selected.id] || selected.modelUrl || '';
    setReferenceUrl(selected.referenceUrl || '');
    setReferenceName(selected.referenceName || `${selected.id}.png`);
    setReferenceDataUrl('');
    setGeneratedModelUrl(existingModel);
    setSelectedPartId(selected.parts?.[0]?.id || '');
    setGeneration(existingModel
      ? { status: 'success', progress: 100, taskId: selected.taskId || '', message: selected.modelUrl ? 'GLB model ready' : 'Saved GLB ready' }
      : { status: 'concept', progress: null, taskId: '', message: isCar ? 'Interactive concept model ready' : isCase ? 'Interactive case concept ready' : 'Concept model ready' });
  }, [selected.id, selected.modelUrl, selected.referenceName, selected.referenceUrl, selected.taskId, selected.parts, generatedModels, isCar, isCase]);

  useEffect(() => {
    if (!referenceUrl) return;
    let cancelled = false;
    fetch(referenceUrl)
      .then((response) => response.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onload = () => { if (!cancelled) setReferenceDataUrl(String(reader.result || '')); };
        reader.readAsDataURL(blob);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [referenceUrl]);

  const selectCollection = (nextCollectionId) => {
    setCollectionId(nextCollectionId);
    setMode('overview');
  };

  const selectItem = (item) => {
    setSelectedIds((current) => ({ ...current, [collectionId]: item.id }));
    setMode('overview');
  };

  const cycleItem = (direction) => {
    const index = items.findIndex((item) => item.id === selected.id);
    const nextIndex = (index + direction + items.length) % items.length;
    selectItem(items[nextIndex]);
  };

  const handleReference = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setReferenceUrl(URL.createObjectURL(file));
    setReferenceName(file.name);
    setGeneratedModelUrl('');
    setGeneration({ status: 'ready', progress: null, taskId: '', message: 'Reference image loaded' });
    const reader = new FileReader();
    reader.onload = () => setReferenceDataUrl(String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const startTripoGeneration = async () => {
    if (!referenceDataUrl || generatedModelUrl || generation.status === 'uploading' || generation.status === 'running') return;
    setGeneration({ status: 'uploading', progress: null, taskId: '', message: 'Uploading to Tripo' });
    try {
      const createResponse = await fetch(`${MODEL_API_BASE}/api/3d/generate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageDataUrl: referenceDataUrl, fileName: referenceName || `${selected.id}.png` }),
      });
      const createPayload = await createResponse.json();
      if (!createResponse.ok) throw new Error(createPayload.error || 'Tripo task creation failed');
      await pollTripoStatus(createPayload.taskId);
    } catch (error) {
      setGeneration({ status: 'error', progress: null, taskId: '', message: error.message || 'Tripo generation failed' });
    }
  };

  const pollTripoStatus = async (taskId) => {
    for (let attempt = 0; attempt < 90; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, attempt === 0 ? 1500 : 4000));
      const response = await fetch(`${MODEL_API_BASE}/api/3d/status/${encodeURIComponent(taskId)}`);
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Tripo status check failed');
      const status = String(payload.status || 'running').toLowerCase();
      const progress = typeof payload.progress === 'number' ? payload.progress : null;
      setGeneration({ status: terminalStates.has(status) ? 'success' : 'running', progress, taskId, message: terminalStates.has(status) ? 'GLB model ready' : `Tripo ${status}` });
      if (terminalStates.has(status) && payload.modelUrl) {
        const modelUrl = resolveModelUrl(payload.modelUrl);
        setGeneratedModels((current) => ({ ...current, [selected.id]: modelUrl }));
        setGeneratedModelUrl(modelUrl);
        return;
      }
      if (failureStates.has(status)) throw new Error(payload.error || `Tripo failed: ${status}`);
    }
    throw new Error('Tripo task timed out');
  };

  const exportScreenshot = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `${selected.id}-showroom.png`;
    link.click();
  };

  const exportGlb = () => {
    if (generatedModelUrl) {
      const link = document.createElement('a');
      link.href = generatedModelUrl;
      link.download = `${selected.id}-tripo.glb`;
      link.click();
      return;
    }
    if (!modelRef.current) return;
    new GLTFExporter().parse(modelRef.current, (glb) => {
      const url = URL.createObjectURL(new Blob([glb], { type: 'model/gltf-binary' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selected.id}-concept.glb`;
      link.click();
      URL.revokeObjectURL(url);
    }, undefined, { binary: true });
  };

  const activeUploadDisabled = !referenceDataUrl || !!generatedModelUrl || generation.status === 'uploading' || generation.status === 'running';
  const CollectionIcon = collection.icon;

  return <main className={`showroom${isCar ? ' machine-theme' : isCase ? ' case-theme' : ''}`}>
    <aside className="catalog-panel">
      <div className="brand"><span className="brand-mark"><CollectionIcon size={18} /></span><div><strong>PIONEERS</strong><small>{collection.title}</small></div></div>
      <div className="collection-tabs">
        {Object.values(collections).map((entry) => { const Icon = entry.icon; return <button key={entry.id} type="button" className={collectionId === entry.id ? 'active' : ''} onClick={() => selectCollection(entry.id)}><Icon size={15} />{entry.label}</button>; })}
      </div>
      <div className="animal-list">
        {items.map((item) => <button key={item.id} type="button" className={selected.id === item.id ? 'animal-item active' : 'animal-item'} onClick={() => selectItem(item)}>
          <span className="thumb-orbit" style={{ background: `radial-gradient(circle at 40% 38%, #fff 0 28%, ${item.palette[0]} 30% 62%, ${item.palette[3]} 64%)` }}><span style={{ boxShadow: `10px 0 0 ${item.palette[2]}` }} /></span>
          <span><strong>{item.id}</strong><small>{item.name}</small></span><em>{item.badge || item.conservation}</em>
        </button>)}
      </div>
      <div className="mini-upload"><label htmlFor="reference"><UploadCloud size={16} />Add image</label><input id="reference" type="file" accept="image/*" onChange={handleReference} /><button type="button" onClick={startTripoGeneration} disabled={activeUploadDisabled}><Sparkles size={16} />Tripo 3D</button><p>{generation.message}{generation.progress !== null ? ` · ${generation.progress}%` : ''}</p></div>
    </aside>

    <section className="hero-panel">
      <header className="hero-header"><div><p>{selected.rarity}</p><h1>{selected.id}</h1><span>{selected.name} · {selected.latin}</span></div><div className="hero-actions"><button type="button" onClick={() => setProofMode((value) => !value)} className={proofMode ? 'active' : ''} title="3D Proof"><Cuboid size={18} /></button><button type="button" onClick={exportScreenshot} title="导出截图"><Camera size={18} /></button><button type="button" onClick={exportGlb} title="导出 GLB"><Download size={18} /></button></div></header>
      <div className="canvas-stage"><button type="button" className="stage-arrow left" onClick={() => cycleItem(-1)}><ChevronLeft size={18} /></button><Canvas shadows camera={{ position: [0, 1.2, 5.2], fov: 40 }} gl={{ preserveDrawingBuffer: true, antialias: true }}><Suspense fallback={<Html center><span className="loading-pill">Loading model</span></Html>}><Scene item={selected} isCar={isCar} isCase={isCase} referenceUrl={referenceUrl} generatedModelUrl={generatedModelUrl} modelRef={modelRef} proofMode={proofMode} selectedPartId={selectedPartId} onPartSelect={(partId) => { setSelectedPartId(partId); setMode('habitat'); }} /></Suspense></Canvas><button type="button" className="stage-arrow right" onClick={() => cycleItem(1)}><ChevronRight size={18} /></button><div className="bottom-dock">{modes.map((item) => { const Icon = item.icon; return <button key={item.id} type="button" className={mode === item.id ? 'active' : ''} onClick={() => setMode(item.id)}><Icon size={15} />{item.label}</button>; })}</div></div>
    </section>

    <aside className="spec-panel">
      <div className="profile-card"><div className="profile-top"><span className="avatar-ring"><span /></span><div><strong>{selected.name}</strong><small>{selected.habitat}</small></div></div><p>{isCar ? '把代表性酷车做成可交互的 3D 机械商品页：看外形、点部件、理解为什么它会快或能越野。' : isCase ? '把灵感场景做成可录屏的 3D 应用案例：看模型、点结构、理解它能用在什么知识场景。' : '把中国独特动物做成可交互的 3D 教育商品页：看形态、学栖息地、理解保护行动。'}</p></div>
      <InsightCard item={selected} mode={mode} isCar={isCar} isCase={isCase} selectedPart={selectedPart} />
      {selected.parts?.length > 0 && <div className="parts-card"><strong>{isCar ? 'PART HOTSPOTS' : isCase ? 'CASE HOTSPOTS' : 'BODY HOTSPOTS'}</strong>{selected.parts.map((part) => <button key={part.id} type="button" className={selectedPart?.id === part.id ? 'active' : ''} onClick={() => { setSelectedPartId(part.id); setMode('habitat'); }}><span>{part.name}</span><small>{part.tag}</small></button>)}</div>}
      <div className="stats-card"><strong>{isCar ? 'SYSTEM MAP' : isCase ? 'VALUE MAP' : 'LEARNING SIGNALS'}</strong>{Object.entries(selected.stats).map(([key, value]) => <div className="stat-row" key={key}><span>{key}</span><div><i style={{ width: `${value}%`, background: `linear-gradient(90deg, ${selected.palette[3]}, ${selected.palette[2]})` }} /></div><b>{value}</b></div>)}</div>
      <div className="fact-card"><strong>{isCar ? 'ENGINEERING NOTES' : isCase ? 'DEMO NOTES' : 'FIELD NOTES'}</strong>{selected.facts.map((fact) => <p key={fact}><Leaf size={14} />{fact}</p>)}</div>
      <div className="color-card"><strong>FINISHES</strong><div>{selected.palette.map((color) => <span key={color} style={{ background: color }} />)}</div></div>
      <div className="note-card"><ImagePlus size={18} /><p>{generatedModelUrl ? '当前正在展示真实或已保存的 GLB。没有 GLB 的条目可上传参考图后逐个替换成 Tripo 生成模型。' : isCar ? '当前是可点选部件的 3D 车体概念模型。上传单体参考图后可用 Tripo 替换成真实 GLB。' : isCase ? '当前是可录屏讲解的 3D 应用案例。也可以上传对应参考图，用 Tripo 替换成真实 GLB。' : '当前是教育概念 3D 形态。上传单体参考图后点击 Tripo 3D，可替换为真实 GLB。'}</p></div>
    </aside>
  </main>;
}

export default App;
