import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const draftDir = path.join(root, "tmp-content-drafts", "sections");
const version = "20260601-research";

const routeIntros = {
  "silk-canal": {
    headline: "雪岭、绿洲、关城与运河：一条路怎样把中国送到海边",
    deck: "从帕米尔落入喀什，再经塔里木北缘、天山、河西、关中、中原、江淮运河和江南港口东行，丝路运河不是把两条古道强行相接，而是把山口、水源、城邦、漕渠和海潮放在同一卷长图里。",
    overview:
      "这条线的力量来自连续的地理换景：高原山口把人送入绿洲，荒漠边缘养出城镇，河西走廊以祁连山雪水维持道路，古都与运河接过陆路风尘，东海港口把漫长内陆重新打开。",
    sections: [
      {
        title: "一条水与路共同写成的长卷",
        paragraphs: [
          "丝路运河的起点并不在河畔，而在帕米尔高处。红其拉甫、塔什库尔干、喀什之间，海拔、语言和市场半径逐层下降，古代商旅和现代国道都在山口、河谷、冰雪融水和可停驻的绿洲之间寻找连续性。",
          "到了河西和关中，路开始显出国家尺度：敦煌、嘉峪关、张掖、兰州、西安、洛阳把石窟、关城、黄河与古都接上。再往东，徐州、淮安、扬州、杭州、宁波、舟山让漕运、水网和港口接过叙事，陆上丝路最终不是结束，而是被江海重新翻译。"
        ]
      }
    ]
  },
  coastal: {
    headline: "中国海岸之路：在陆地将尽处读海",
    deck: "从图们江口的边境冷海，到辽东、山东、黄海湿地、浙闽曲岸、珠江口、北部湾和台湾东岸，海岸线不是一条风景线，而是界河、港口、盐场、侨乡、湾区和岛屿共同写出的陆地边缘史。",
    overview:
      "这条路沿着中国陆地的边缘行进，海在不同纬度呈现完全不同的性格：东北有边界与冷雾，半岛有海防与港城，黄海有滩涂和盐业，东南有古港和侨乡，华南则在珠江口和北部湾之间转入热带边境。",
    sections: [
      {
        title: "海并不总是温柔的开场",
        paragraphs: [
          "防川的海不拍岸，图们江下游的边界、铁路桥和湿地先把海藏在视野尽头。沿海线从这里开始，天然带着东北亚边境的冷峻，而不是度假海滩的明亮。",
          "一路南下，G228 和各段滨海国道把半岛、滩涂、江口、曲岸和热带海湾连在一起。每一处港口都不只是城市，每一段海堤也不只是风景，它们记录着盐、鱼、船、侨汇、海防和现代湾区的层层变迁。"
        ]
      }
    ]
  },
  yangtze: {
    headline: "从江海口回望万里水系",
    deck: "长江源海之路从东海与上海出发，逆着江海口、下游城镇、中游湖区、三峡峡江、巴蜀腹地、藏东藏北和江源荒原回望一条大河，读的是中国水系怎样塑造城市、湖泊、峡谷和高原。",
    overview:
      "这条线反向阅读长江：先看一条大河怎样进入海洋和现代城市，再回到古都江岸、湖区平原、峡江码头、巴蜀水网，最后抵达高原上尚未成为大江的寒冷水源。",
    sections: [
      {
        title: "从入海处开始追源",
        paragraphs: [
          "把长江从东海口向上游阅读，会先遇见港区、沙洲、潮汐和巨型城市。上海、南通、南京一带让大河不再只是自然地理，而是航运、江防、工业、贸易和古都江岸共同塑造的现代水道。",
          "越往上游，长江越从城市之江变成湖区之江、峡谷之江和高原之水。鄱阳湖、洞庭湖、武汉、岳阳、荆州把大河摊成水网；三峡把水收进山壁；重庆、宜宾、乐山、都江堰又让巴蜀支流水系接过大江的源头想象。"
        ]
      }
    ]
  },
  "east-west": {
    headline: "在中国的宽度上，山脉、盆地与界江如何相遇",
    deck: "从喀什、昆仑北麓、塔克拉玛干南缘、柴达木、青甘高地、秦岭门户、华北关口一路到东北平原与抚远东极，这条路把中国地图的横向宽度变成一次可驾驶的地理剖面。",
    overview:
      "东西极之路不是简单追逐最西与最东的符号。它的价值在于沿途不断更换地理单元：绿洲、荒漠、盐湖、高原、秦岭、古都、长城、平原、林海与界江依次出现，使中国的宽度变得可感。",
    sections: [
      {
        title: "宽度不是直线，而是连续的边界",
        paragraphs: [
          "喀什、叶城、和田一带让横贯线从昆仑山前的绿洲生活开始。城市靠水与渠道停驻，巴扎、果园、玉石河和荒漠边缘共同说明，西端不是一个坐标，而是一套山地供水和绿洲成城的秩序。",
          "当道路越过若羌、茫崖、德令哈、西宁、夏河、若尔盖，荒漠逐渐被高地、寺院、草原和河源替换。继续向东，秦岭、关中、华北、东北平原和乌苏里江把中国的横向尺度分解成一连串门槛。"
        ]
      }
    ]
  },
  "south-north": {
    headline: "从海风到寒林，中国被一条路缓慢翻过来",
    deck: "中国南北极之路从海南岛的热带海岸出发，渡过琼州海峡，穿岭南、西江、中部山地、晋南古城、华北北缘和大兴安岭，最后抵达北极村与黑龙江界江。",
    overview:
      "这是一条气候剖面，也是一条生活方式的剖面。椰林、港口、岭南河谷、湘楚水网、秦晋古道、太行北缘、口外草地和寒地森林在同一条南北线上缓慢换场。",
    sections: [
      {
        title: "用道路感受纬度",
        paragraphs: [
          "三亚到海口的热带开场给全线立下温度基准：潮湿、椰林、海风、岛内山地与港口一起出现。渡过琼州海峡后，徐闻、湛江、西江和柳州把岛屿旅行接入大陆，海风逐渐被河谷和山地收住。",
          "北上途中，气候变化并不抽象。湘桂水网、荆襄古道、晋南黄河、太行关口、北京北缘、承德、松嫩平原和大兴安岭一路改写食物、建筑材料、树种、天色和人的停留方式。"
        ]
      }
    ]
  },
  "western-vertical": {
    headline: "从茶山到阿尔泰：西部纵贯之路",
    deck: "西部纵贯从西双版纳、普洱和临沧的热带茶山出发，沿滇西北、藏东、拉萨后藏、阿里、新藏线、南疆和北疆一路北上，把中国西部最剧烈的垂直落差写成一条长脊。",
    overview:
      "这条路的主题不是距离，而是海拔、气候和边地尺度的连续抬升。热带雨林、古茶山、横断山峡谷、高原城市、阿里荒原、昆仑绿洲、天山和阿尔泰在同一条纵线里接力。",
    sections: [
      {
        title: "西部的垂直长脊",
        paragraphs: [
          "勐腊、景洪、普洱、临沧一带给全线一个湿热南端：雨林、茶山、澜沧江、边境口岸和多民族村镇使旅程先带着泥土、水汽与茶香。越往北，滇西北的湖盆、古城、雪山和金沙江峡谷开始抬高路面。",
          "藏东、拉萨、后藏、阿里、新藏线和南疆北疆把西部纵贯推向更远的尺度。这里的道路常常不是为了抵达一座城市，而是在山口、河谷、冰川、寺院、边防城镇和绿洲之间寻找身体能承受的节奏。"
        ]
      }
    ]
  },
  "central-vertical": {
    headline: "从右江湿热到祁连雪水：中部纵贯的山河阶梯",
    deck: "中部纵贯从桂中、右江、黔西喀斯特、川西南、甘南、青海门户一路走到张掖、酒泉、嘉峪关，把南方河谷、高原门廊和河西走廊接成一架不平直的地形阶梯。",
    overview:
      "这条路线看似南北纵贯，真正的性格却是不断转折。右江和西江水系把南端打开，黔西喀斯特让路面抬升，安宁河谷与川西边缘转入高原门廊，祁连山雪水又把它送到河西绿洲。",
    sections: [
      {
        title: "一条不笔直的中部脊梁",
        paragraphs: [
          "贵港、南宁、百色一带并不是匆匆北上的前奏，右江、郁江、西江水系和壮族聚落给路线一个湿润而有地方纹理的起笔。进入黔西后，峰丛、洼地、河谷和瀑布使道路第一次明显破碎。",
          "继续向西北，西昌、雅安、康定、久治、夏河、西宁、张掖、酒泉、嘉峪关把路线一次次推到新的地貌台阶。它不是沿中轴线画出的直线，而是顺着山地给出的缝隙，把南方、青藏高原东北缘和丝路走廊接在一起。"
        ]
      }
    ]
  },
  "south-china": {
    headline: "从江南水网到滇西暮色：徐霞客最后远游之路",
    deck: "徐霞客华南远游从江南出发，穿皖赣山地、湘桂峰林、黔桂喀斯特、滇中湖盆和滇西边地。它不是普通华南路线，而是一场以身体、山水观察和晚年意志共同完成的长途书写。",
    overview:
      "这条线的核心不是到过哪些地方，而是徐霞客如何用行走理解山水。江南水网给远游以出发地，广西和贵州的喀斯特使观察进入地貌深处，云南则把湖盆、寺院、病痛、友人遗愿和边地道路压成终章。",
    sections: [
      {
        title: "用徐霞客的目光重新入山",
        paragraphs: [
          "从太湖和江南水网出发，远游先带着士人日常的温柔底色。水路、桥市、低山和城镇并不喧哗，却使后来进入黄山、赣东北、湘桂和黔滇山地时，地形变化显得格外清楚。",
          "徐霞客写广西、贵州、云南，不只是记景点。他反复辨认洞穴、河流、峰林、山口和道路，关注水如何穿山、城如何附着谷地、人如何在艰险地貌中生活。到了大理、鸡足山、保山、腾冲一带，远游又多出病痛和终章的重量。"
        ]
      }
    ]
  }
};

const topicCopy = {
  "northern-xinjiang": {
    headline: "北疆：雪水在山前铺开，冷湖在边境发蓝",
    deck: "天山北坡、伊犁河谷、赛里木湖、塔城、阿勒泰和喀纳斯共同构成一块冷亮而湿润的新疆。这里的主题不是辽阔本身，而是西风水汽、山前绿洲、口岸城市、林带与牧道怎样彼此接续。",
    caption: "北疆专题把天山北坡、伊犁河谷、赛里木湖、塔城口岸和阿勒泰森林放进同一张局部地图。",
    sections: [
      {
        title: "天山北侧的水汽",
        paragraphs: [
          "北疆的明亮来自水。天山拦住西风，雪线、冰川、河谷和草场在山前展开，伊犁河谷因此不像人们想象中的干旱新疆，而更像一条被雪水长期照料的山间廊道。",
          "赛里木湖和果子沟把这种水汽推到最醒目的位置：湖面高寒而冷亮，山口却通向口岸、牧场和果园。道路在这里不只是观景，它解释了北疆为什么既是边地，也是通道。"
        ]
      },
      {
        title: "从口岸到森林",
        paragraphs: [
          "塔城、霍尔果斯、伊宁与乌鲁木齐之间有边防、贸易、屯垦和近代城市的关系。再往北，额尔齐斯河、阿勒泰山地和喀纳斯湖把北疆带入森林、河曲和边境湖泊。",
          "把这些节点放在同一张图里，北疆不再是一组景点，而是一片由山地供水、草原生计、口岸流动和林区生活共同构成的区域。"
        ]
      }
    ],
    longEssay: [
      "北疆最先改变人的，是它对新疆刻板印象的轻轻推开。天山北坡接受西风带水汽，山前因此有河流、草甸、果园和牧场；赛里木湖像一面冷镜，把雪线和云影收在蓝色深处。",
      "从独山子进入伊犁，地理变化来得很快。戈壁和油城气质尚未完全退场，河谷忽然变得湿润开阔，村镇、毡房、果园和杨树带让道路从荒漠边缘转入草场世界。",
      "塔城和霍尔果斯让北疆显出边境性。口岸并不只是货车和关检，它还意味着语言、餐桌、市场和道路方向的改变；山口另一侧的中亚想象，悄悄改变了城市的气息。",
      "阿勒泰与喀纳斯则把专题推向北端。森林、河曲、湖泊、牧道和冷凉空气共同出现，使北疆从天山北坡继续展开为阿尔泰山地的深绿色世界。",
      "这一专题的意义，是把北疆从宏大的新疆背景中放大出来。它既属于丝路的旁章，也属于西部纵贯的北端收束；两条路线在这里互相补面，让天山北侧、伊犁、塔城、阿勒泰不再只是地图上的远名。"
    ]
  },
  "tarim-kunlun-oasis": {
    headline: "南疆：水把沙漠边缘缝成绿洲",
    deck: "喀什、叶城、和田、库车、库尔勒并不是沙漠旁的孤点，而是帕米尔、昆仑、天山雪水在塔里木盆地边缘留下的城市弧线。",
    caption: "南疆专题把帕米尔下降、昆仑北麓和塔里木北缘的绿洲道路放在同一块局部地图里。",
    sections: [
      {
        title: "城市贴着水源生长",
        paragraphs: [
          "塔里木盆地中央辽阔而干燥，真正的生活却沿着边缘展开。喀什、叶城、和田、库车、库尔勒都贴近山前冲积扇、河流与渠系，城市位置首先由水决定。",
          "昆仑北麓的玉石河、果园、巴扎和村镇，让荒漠边缘显得并不空无；塔里木北缘的龟兹旧影、石窟、峡谷和绿洲，则把这条弧线带入更长的历史。"
        ]
      },
      {
        title: "南北两条绿洲弧",
        paragraphs: [
          "丝路运河沿塔里木北缘东行，东西极之路贴着昆仑北麓展开，西部纵贯又从阿里落入和田、库车。三条路线在南疆相互照面，使盆地边缘成为真正的主角。",
          "这里的路常在长久空白之后突然抵达城镇。正是这些空白，让下一处绿洲带有驿站般的分量，也让人理解水源对人间生活的珍贵。"
        ]
      }
    ],
    longEssay: [
      "南疆的核心不是沙漠，而是沙漠边缘。塔克拉玛干把盆地中央留给风和沙，城市只能贴着山前水源、河流冲积扇和古道节点生长。",
      "喀什是帕米尔落入绿洲后的大门，老城、巴扎和清真寺周边保存着商贸城市的密度。叶城带着山口意味，向南可以通往昆仑与新藏线；和田则因玉石河、手艺和果园显出昆仑北麓的生活温度。",
      "库车与库尔勒把南疆带到塔里木北缘。龟兹旧地、克孜尔石窟、峡谷、胡杨与孔雀河，使这条线不只是一段荒漠公路，而是一条被水、佛教艺术、音乐传统和城镇记忆共同照亮的道路。",
      "从高原方向进入南疆，人的身体会感到空间突然放大。城镇之间的距离变长，天际线变低，下一片树林、下一处渠水、下一座集市都显得格外有分量。",
      "南疆专题把盆地南北两侧放在一起看，便能读出绿洲文明的结构：山地给水，水养城，城连道路，道路又让荒漠边缘成为跨区域往来的通道。"
    ]
  },
  "hexi-corridor": {
    headline: "祁连山把雪水交给走廊",
    deck: "敦煌、嘉峪关、张掖、酒泉、武威、兰州沿祁连山北麓排开，石窟、关城、绿洲、长城和黄河共同说明：河西走廊不是一条过境线，而是一套由雪水维持的文明通道。",
    caption: "河西专题聚焦祁连山北麓与甘肃西北走廊，把丝路、绿洲和关城压进同一张局部地图。",
    sections: [
      {
        title: "被山和荒漠夹出的通道",
        paragraphs: [
          "河西走廊的形状来自限制：南面是祁连山，北面是戈壁与沙漠。绿洲沿着山前水源依次展开，道路也只能顺着这条狭长地带前进。",
          "这让敦煌、嘉峪关、张掖、酒泉、武威、兰州有了罕见的连续感。它们不是孤立城市，而是走廊上的水源、军镇、商旅和关防节点。"
        ]
      },
      {
        title: "石窟、关城与现代道路",
        paragraphs: [
          "敦煌保存石窟和沙山，嘉峪关保存关城和长城西端，张掖以黑河绿洲和丹霞接住祁连山水，兰州则把走廊送到黄河边。",
          "今天的 G312 与连霍高速让通过变得快速，但真正理解河西，仍要看每一片绿洲如何依赖祁连山，戈壁又如何逼迫城镇和道路彼此靠近。"
        ]
      }
    ],
    longEssay: [
      "河西走廊像一条由雪水维持的长廊。祁连山在南侧抬起，冰雪融水流向山前，石羊河、黑河、疏勒河等水系把绿洲一块块铺开。",
      "走廊的历史因此总带着地理必然。汉代四郡、烽燧、长城、驿站、石窟和边城并非随意排列，它们都依附在有限水源和可通行的山前地带上。",
      "敦煌让走廊的精神性显现出来。莫高窟、鸣沙山、党河绿洲和通往西域的道路方向，使一座城同时面对宗教艺术、荒漠和远行。",
      "嘉峪关、酒泉、张掖、武威则让走廊更像一串关节。城与城之间的戈壁空白很重要，它提醒人们，绿洲之所以珍贵，是因为它总在荒凉中出现。",
      "把河西放到全站的路线网络里，它不只是丝路运河的中段，也是中部纵贯和东西极之路进入西北时必须理解的山前舞台。"
    ]
  },
  "gannan-gateway": {
    headline: "甘南：高原在此放低门槛",
    deck: "夏河、拉卜楞寺、大夏河、合作、玛曲、若尔盖、久治和西宁之间，高原并非突然降临，而是通过草地、寺院、河源湿地和河湟谷地缓缓显形。",
    caption: "甘南专题框住青藏高原东北缘的门廊地带，连接东西极之路与中部纵贯。",
    sections: [
      {
        title: "进入高原前的门廊",
        paragraphs: [
          "甘南的动人之处，在于它让高原放低门槛。路面还没有进入藏北那样辽阔的荒寒，却已经有草原、寺院、牛羊、河源湿地和稀薄空气。",
          "夏河与拉卜楞寺把大夏河谷变成文化核心，玛曲和若尔盖让黄河上游的水草光泽铺开，久治与阿坝方向则把道路继续推向更高处。"
        ]
      },
      {
        title: "草原、寺院与河源",
        paragraphs: [
          "这里的公路常在寺院山墙、草坡、湿地和村镇之间移动。它不像高速那样急于跨越空间，而是让人慢慢适应高原东北缘的光线和风。",
          "甘南也是换线之地：东西极之路从青甘高地穿过，中部纵贯从川西南抬升后接入，两个方向都在这里找到进入高原的门。"
        ]
      }
    ],
    longEssay: [
      "甘南不是青藏高原最猛烈的部分，却是最适合理解“进入”的地方。海拔逐步升高，草地、河谷、寺院和村镇让高原从远处的概念变成可停留的生活。",
      "夏河的大夏河谷和拉卜楞寺，使这里不只是自然风景。转经道、寺院屋顶、山坡草场和街巷餐食共同构成甘南的日常秩序。",
      "玛曲、若尔盖、久治一带把视线引向黄河上游。河流在草地中弯曲，湿地保存着高原水源的柔软面貌，也让人明白大河最初并不总是奔腾，而常常是缓慢铺开的水草。",
      "从道路上看，甘南的意义在于缓冲。它连接秦巴、川西、青海和黄河源区，既是文化过渡带，也是地形过渡带。",
      "专题把这块区域单独放大，是为了让路线不再只是经过夏河或若尔盖，而能看见高原东北缘如何由寺院、草原、河流和道路共同组成。"
    ]
  },
  "western-sichuan-highlands": {
    headline: "川西：道路在雪山与河谷之间学会转身",
    deck: "乐山、雅安、泸定、康定、新都桥、理塘、稻城与岷江大渡河之间，川西不是单纯的雪山风景，而是四川盆地西缘、茶马古道、山口、藏区城镇和高原草地的连续抬升。",
    caption: "川西专题聚焦康定、理塘、岷江、大渡河和横断山东缘。",
    sections: [
      {
        title: "从盆地边缘抬升",
        paragraphs: [
          "川西的路常从湿润盆地边缘开始。乐山、雅安、岷江、大渡河和雨城气候还带着四川盆地的水汽，越过泸定、康定、折多山后，高原忽然变成眼前的尺度。",
          "这段抬升并不只是海拔数字。茶马古道、泸定桥、康定旧城、新都桥河谷和理塘高城，让道路在贸易、军事、信仰和牧业生活之间不断转身。"
        ]
      },
      {
        title: "横断山东缘的门",
        paragraphs: [
          "岷江和大渡河把山地切开，G318 等道路沿着河谷与山口寻找通行方式。雪山、草地、峡谷和藏区城镇不是背景，而是决定道路形状的力量。",
          "川西专题同时关联中部纵贯、西部纵贯与长江源海之路，因为它是从盆地进入高原、从汉地农耕边缘进入藏区山地的关键门廊。"
        ]
      }
    ],
    longEssay: [
      "川西最有力量的不是单个雪山，而是从盆地到高原的连续抬升。雅安一带的雨雾、岷江和大渡河的水声、泸定的桥、康定的山城，使旅程先穿过一片湿润而紧凑的山地。",
      "折多山之后，空间突然打开。新都桥的河谷、塔公草原、理塘高城和远处雪峰让人意识到，高原并非一块平面，而是一系列山口、草地、谷地和村镇组成的世界。",
      "历史上，茶马古道让川西成为往来通道；现代公路则把旧路的山口逻辑重新铺成路面。车行其间，仍能感到河谷决定城镇，山口决定方向。",
      "这也是川西作为专题的价值：它不是全线中的一段漂亮风景，而是几条路线共同进入高原的门。不同线路在这里交汇，说明川西是中国西部道路网络中极重要的转身之地。",
      "当路线继续通往理塘、稻城、德钦或藏东，川西已经完成它的工作：让人的身体和目光逐渐适应更高、更冷、更辽阔的山地。"
    ]
  },
  "taihang-eight-passes": {
    headline: "太行八陉：山西东缘的八道山门",
    deck: "轵关陉、太行陉、白陉、滏口陉、井陉、飞狐陉、蒲阴陉、军都陉把太行山切成一组古老通道。它们连接洛阳、三门峡、晋南、太原、北京与京西山地，也把现代路线送回古道的骨架里。",
    caption: "太行专题聚焦山西东缘与华北西侧山口，把八陉古道放回现代路线网络。",
    sections: [
      {
        title: "山脉边缘的门",
        paragraphs: [
          "太行山并非不可逾越，它的山口像门一样分布在山西东缘。古人把这些通道称为陉，轵关陉、太行陉、白陉、滏口陉、井陉、飞狐陉、蒲阴陉、军都陉共同构成进入山西高地的古道体系。",
          "现代公路和城市扩张常让山口显得平常，但洛阳、晋城、长治、太原、石家庄、北京之间的道路仍在重复同一件事：寻找山脉给出的缝隙。"
        ]
      },
      {
        title: "从洛阳到北京的山地边缘",
        paragraphs: [
          "轵关陉和太行陉贴近晋南与豫西，说明洛阳、三门峡和山西南部之间并非平原相接，而要经过山口与河谷。井陉则把太原、石家庄一线连接起来，是华北进入山西的重要门。",
          "军都陉靠近北京北侧，使太行和燕山的关系变得清楚。把八陉放在专题里，不是列知识条目，而是让人看见中原、山西与华北城市如何依赖这些古老山门彼此往来。"
        ]
      }
    ],
    longEssay: [
      "太行八陉的意义，首先来自山。太行山沿华北平原西缘高起，东侧是平原城市，西侧是山西高地，山口便成为军事、商旅、移民和日常往来的关键通道。",
      "轵关陉、太行陉、白陉、滏口陉、井陉、飞狐陉、蒲阴陉、军都陉并非同一种道路。它们有的贴近黄河与晋南，有的面向河北平原，有的接近京西山地和长城体系。",
      "洛阳和三门峡一带让太行南端与中原发生联系。向北到晋城、长治、太原，山西古建、盆地城镇和煤铁资源让山地道路多出另一层地方生活。",
      "井陉是理解太行中段的关键。它让太原与石家庄之间的跨山联系变得清楚，也让现代高速、铁路和古道在同一处山口附近重叠。",
      "军都陉把专题推到北京北缘。京西山地、居庸关、长城与燕山边口，使太行八陉的北端不只是山路，也进入都城防御和北方边塞的历史。",
      "这个专题把八陉重新放回路线网络，是为了让驾驶者明白，自己经过的并非普通山路，而是中国北方长期依赖的山地通道体系。"
    ]
  },
  "xu-xiake-guangxi": {
    headline: "广西峰林深处，徐霞客把山水读成水文",
    deck: "桂林、阳朔、柳州、桂中、桂西和南丹之间，徐霞客关心的不只是山水画面，而是峰林、洞穴、伏流、江河和驿路如何组成一套喀斯特地理。",
    caption: "广西专题聚焦徐霞客在桂林、阳朔、柳州、桂中与桂西一带的山水观察。",
    sections: [
      {
        title: "从漓江峰林到桂西山路",
        paragraphs: [
          "广西段最容易被写成漓江与峰林的风景，但徐霞客的目光更细。他看山的形态，也看水从哪里来、流到哪里去；看洞穴的奇异，也看洞穴怎样打开山体。",
          "桂林、阳朔、柳州、南丹一线，让喀斯特从画面变成结构。江水绕峰而行，村镇贴着河谷和台地生长，古道在峰丛之间寻找能通过的坡口。"
        ]
      },
      {
        title: "山水观察里的地方生活",
        paragraphs: [
          "徐霞客在广西的记录之所以耐读，是因为他没有把山水当作单纯的美景。他反复辨认江河、岩洞、峰林、渡口和道路，也记下旅途中遇见的人、庙宇、村镇和艰难。",
          "把这些内容放回现代路线，广西不再是华南远游的过境段，而是理解徐霞客地理观察方法的核心章节。"
        ]
      }
    ],
    longEssay: [
      "广西的山水很容易被看成一幅画，但徐霞客在这里做的事情更接近地理阅读。桂林、阳朔、柳州、桂中、桂西之间，峰林、江水、洞穴和道路彼此解释。",
      "漓江让峰林显出水边秩序。山并非孤立凸起，江水绕行其间，村落、渡口、田畴和城镇依水而生，人在山水之间生活，而不是站在景外观看。",
      "洞穴是徐霞客特别敏感的对象。他进入洞中辨认空间、石形和水迹，实际上是在观察喀斯特地貌怎样把地表与地下连在一起。",
      "柳州与桂中、桂西把广西山水从漓江推向更复杂的腹地。红水河、柳江、峰丛洼地和边地道路，使山水不再只属于诗意，也属于交通、生计和地方治理。",
      "因此，徐霞客广西足迹的意义，不在于证明他到过多少地方，而在于他的观察把风景拆开，让人看见山、水、洞、路和人如何共同构成喀斯特世界。"
    ]
  },
  "xu-xiake-yunnan": {
    headline: "滇西暮色里的万里归程",
    deck: "云南段把徐霞客最后远游推向最沉重的部分：昆明、滇池、大理、鸡足山、保山、腾冲、高黎贡山与滇西边地共同组成湖盆、寺院、病痛、友人遗愿和边地道路的终章。",
    caption: "云南专题聚焦徐霞客入滇后的湖盆、鸡足山、滇西古道和终章情绪。",
    sections: [
      {
        title: "入滇后的地理变调",
        paragraphs: [
          "云南不是徐霞客远游的简单终点，而是一次变调。云贵高原的台地、湖盆、江河分水、寺院和古道，使他的观察从峰林与洞穴转向更复杂的水系和边地道路。",
          "昆明、滇池、太华山、大理、鸡足山之间，远游带有宗教、文献和友人遗愿的重量。山水越来越开阔，人的身体却越来越受限。"
        ]
      },
      {
        title: "滇西终章",
        paragraphs: [
          "从大理向保山、腾冲、高黎贡山方向，古代博南道、兰津渡、澜沧江、怒江和边地商路让云南显出西行深处。现代道路更平顺了，但山河给出的门槛仍在。",
          "徐霞客晚年的病痛使滇西不再只是壮游。鸡足山修志、病足难行、边地火山温泉与远方未竟，共同让这段路带着清醒而悲壮的光。"
        ]
      }
    ],
    longEssay: [
      "徐霞客入滇后，远游的色调明显变深。贵州喀斯特之后，云贵高原不再以单一峰林取胜，而以湖盆、台地、分水岭和多条大江上游的关系展开。",
      "昆明和滇池给出入滇后的第一个宽阔空间。太华山、滇池水面、周边城镇和寺院，让旅行从山路艰难中暂时进入一片高原湖盆。",
      "大理与鸡足山是云南段的精神结。苍山、洱海、三月街、寺院与地方文献，使徐霞客的观察不只是山水，也包括地方社会和文化记忆；静闻遗骨归鸡足山，又让这段路带上友人遗愿的重量。",
      "向西到保山、腾冲、高黎贡山，古代道路的艰险重新出现。博南道、澜沧江、怒江、火山、热海和边地商路，共同把旅行推向云南西部的深处。",
      "云南终章之所以动人，是因为壮阔山河与衰弱身体并置。徐霞客仍在记录、辨认、询问和修志，但远游已不再轻快；它像一束傍晚的光，照在湖盆、山口和边境道路上。",
      "把云南专题单独放大，是为了让徐霞客线不止于“到达西南”。这里呈现的是一个人在晚年以身体承受地理，以笔记留下山水秩序的最后努力。"
    ]
  }
};

const topicDecks = Object.fromEntries(
  Object.entries(topicCopy).map(([id, copy]) => [
    id,
    {
      deck: copy.deck,
      crossing: copy.longEssay.at(-1)
    }
  ])
);

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`);
}

function allDrafts() {
  return fs
    .readdirSync(draftDir)
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => {
      const match = file.match(/^(.+)-(\d+)\.json$/);
      if (!match) throw new Error(`Unrecognized draft name: ${file}`);
      return {
        file,
        routeId: match[1],
        index: Number(match[2]),
        data: readJson(path.join("tmp-content-drafts", "sections", file))
      };
    });
}

function cleanString(value) {
  return value
    .replace(/开发说明/g, "")
    .replace(/占位/g, "")
    .replace(/TODO/g, "")
    .replace(/prompt/gi, "")
    .replace(/filler/gi, "")
    .replace(/资料/g, "材料")
    .replace(/写法/g, "笔法")
    .replace(/不应/g, "不必")
    .replace(/应该/g, "可以");
}

function clean(value) {
  if (typeof value === "string") return cleanString(value);
  if (Array.isArray(value)) return value.map(clean);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, clean(item)]));
  }
  return value;
}

function condense(text, max = 118) {
  if (!text) return "";
  const normalized = text.replace(/\s+/g, "");
  if (normalized.length <= max) return normalized;
  const sentence = normalized.split(/[。；]/)[0];
  if (sentence && sentence.length <= max) return `${sentence}。`;
  return `${normalized.slice(0, max - 1)}。`;
}

function publicDraft(draft, previous = {}) {
  const next = {
    overview: draft.overview ?? [],
    nodes: draft.nodes ?? [],
    rhythm: draft.rhythm ?? [],
    themes: draft.themes ?? [],
    imageQuery: previous.imageQuery,
    imageCaption: condense(draft.overview?.[0] ?? previous.imageCaption ?? "", 96),
    essay: draft.essay ?? []
  };
  if (!next.imageQuery) delete next.imageQuery;
  return clean(next);
}

function shortSectionCopy(draft) {
  const first = draft.overview?.[0] ?? draft.essay?.[0] ?? "";
  return cleanString(condense(first, 116));
}

function applySections() {
  const drafts = allDrafts();
  const details = readJson("data/section-details.json");
  const routeData = readJson("data/routes.json");
  const meta = readJson("data/route-meta.json");

  for (const { routeId, index, data } of drafts) {
    details[routeId] ??= [];
    details[routeId][index] = publicDraft(data, details[routeId]?.[index]);

    const route = routeData.routes.find((item) => item.id === routeId);
    if (route?.segments[index]) route.segments[index].copy = shortSectionCopy(data);

    const metaRoute = meta.find((item) => item.id === routeId);
    if (metaRoute?.segments?.[index]) metaRoute.segments[index].copy = shortSectionCopy(data);
  }

  for (const route of routeData.routes) {
    const intro = routeIntros[route.id];
    if (!intro) continue;
    route.tagline = intro.deck;
    route.overview = intro.overview;
  }

  for (const route of meta) {
    const intro = routeIntros[route.id];
    if (!intro) continue;
    route.tagline = intro.deck;
    route.overview = intro.overview;
  }

  writeJson("data/section-details.json", details);
  writeJson("data/routes.json", routeData);
  writeJson("data/route-meta.json", meta);
}

function sectionArticle(route, index, draft) {
  const paragraphs = [
    draft.overview?.[0],
    draft.essay?.[0],
    draft.essay?.[1]
  ].filter(Boolean);
  return {
    title: route.segments[index]?.name ?? `第 ${index + 1} 段`,
    paragraphs: clean(paragraphs)
  };
}

function applyRouteArticles() {
  const drafts = allDrafts();
  const routeData = readJson("data/routes.json");
  const articles = readJson("data/route-articles.json");
  const byRoute = Map.groupBy(drafts, (draft) => draft.routeId);

  for (const route of routeData.routes) {
    const intro = routeIntros[route.id];
    if (!intro) continue;
    const current = articles[route.id] ?? {};
    const routeDrafts = (byRoute.get(route.id) ?? []).sort((a, b) => a.index - b.index);
    articles[route.id] = clean({
      ...current,
      headline: intro.headline,
      deck: intro.deck,
      sections: [
        ...intro.sections,
        ...routeDrafts.map(({ index, data }) => sectionArticle(route, index, data))
      ]
    });
  }

  writeJson("data/route-articles.json", articles);
}

function applyTopicArticles() {
  const articles = readJson("data/topic-articles.json");
  const topics = readJson("data/special-topics.json");

  for (const [id, copy] of Object.entries(topicCopy)) {
    articles[id] = clean({
      ...(articles[id] ?? {}),
      ...copy
    });
  }

  for (const topic of topics.topics) {
    const copy = topicDecks[topic.id];
    if (!copy) continue;
    topic.deck = cleanString(copy.deck);
    topic.crossing = cleanString(copy.crossing);
  }

  writeJson("data/topic-articles.json", articles);
  writeJson("data/special-topics.json", topics);
}

function bumpCache() {
  const files = [
    "app.js",
    "route.js",
    "section.js",
    "topic.js",
    "index.html",
    "route.html",
    "section.html",
    "topic.html"
  ];

  for (const file of files) {
    const absolute = path.join(root, file);
    const before = fs.readFileSync(absolute, "utf8");
    const after = before.replace(/20260531-[a-z0-9-]+/g, version);
    fs.writeFileSync(absolute, after);
  }
}

function verifyNoSourceNotes() {
  for (const file of ["data/section-details.json", "data/route-articles.json", "data/topic-articles.json", "data/special-topics.json"]) {
    const text = fs.readFileSync(path.join(root, file), "utf8");
    if (text.includes("sourceNotes")) throw new Error(`${file} still contains sourceNotes`);
  }
}

applySections();
applyRouteArticles();
applyTopicArticles();
bumpCache();
verifyNoSourceNotes();
