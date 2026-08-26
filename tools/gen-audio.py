# -*- coding: utf-8 -*-
"""用 edge-tts（微软在线中文语音）把 6 张卡 intro + 6 位校友 bio 合成 mp3。
输出到 assets/audio/。无 key、免费、直出 mp3（不需要 ffmpeg）。
用法: python tools/gen-audio.py
"""
import asyncio, os, sys
import edge_tts

VOICE = "zh-CN-XiaoxiaoNeural"   # 自然女声，适合校史展
RATE  = "-2%"
ABS   = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "assets", "audio"))
os.makedirs(ABS, exist_ok=True)

# 每张卡 intro（与 index.html 的 cards[] 严格一致）
INTROS = {
    "chengzhi":   "1904 年，承志学堂创办于南京，为近代首所私立中学之一。后取「钟阜育英才」之意更名钟英，立志育才兴邦。百廿薪火，自此点燃。",
    "xiqian":     "抗战烽火中，钟英师生跋涉西迁，弦歌不辍。颠沛流离间坚守办学，以读书救国，尽显江南学人风骨。",
    "zenggongci": "1954 年定址秦淮九条巷曾公祠，青砖黛瓦间书声琅琅。2014 年恢复钟英校名，文脉绵延，古祠新学。",
    "fuming":     "2014 年，「钟英」校名回归。六十载沧桑，钟阜育才之志不泯；古祠新学，薪火重燃。",
    "xiaoyou":    "钟阜毓秀，群星璀璨。点击星辰，走近一位杰出校友，聆听他们的故事。",
    "xiaoxun":    "勤以治事，朴以修身，诚以待人，毅以立志。四字校训，百廿传承，钟英学子立身之本。",
}

# 6 位校友 bio（与 index.html 的 ALUMNI[] 严格一致）
BIOS = {
    "renxinmin":   "任新民（1915—2017），航天技术与火箭发动机专家，「两弹一星」功勋奖章获得者。1934 年毕业于钟英中学高中部。中国液体火箭发动机、运载火箭与通信卫星工程的奠基人之一，被誉为中国航天「总总师」。以毕生之力为国人叩开太空之门，功勋卓著。",
    "wuliangyong": "吴良镛（1922— ），建筑学家与城市规划学家，中国科学院、中国工程院两院院士，国家最高科学技术奖得主，钟英培养的院士之一。他创立人居环境科学，主持北京菊儿胡同新四合院改造闻名于世，毕生致力于中国人居环境的改善与赓续。",
    "liuxiyao":    "刘西尧（1916—2013），湖南长沙人，1933 年毕业于南京私立钟英中学。曾任中国人民解放军少将，参与中国首次原子弹试验并任副总指挥。后任教育部部长、国家教育委员会副主任，长期主管国家教育与人才培养，贡献深远。",
    "liuyuyi":     "刘宇一（1940— ），著名油画家，南京人，钟英中学校友。擅宏幅主题性历史油画，代表作《良宵》《良辰》《世纪大典》等陈列于人民大会堂等重要场所，以史诗笔触记录时代肖像，被誉为作品进入国家殿堂的当世画家。",
    "yezhaoyan":   "叶兆言（1957— ），当代著名作家，南京人，钟英中学校友，南京文学的代表人物。长篇小说《一九三七年的爱情》与散文《南京人》等笔力深厚，满载六朝烟雨与金陵文脉，多次荣膺茅盾文学奖提名等重要文学奖项。",
    "youbenchang": "游本昌（1933— ），表演艺术家。1951 年毕业于南京私立钟英中学，后入上海戏剧学院深造。因塑造电视剧《济公》形象家喻户晓，从艺数十载以戏载道。2014 年母校百十校庆时重返校园，朗诵《咏松》，为百姓心中难忘的荧屏记忆。",
}

async def gen(name, text):
    out = os.path.join(ABS, name + ".mp3")
    com = edge_tts.Communicate(text, VOICE, rate=RATE)
    await com.save(out)
    size = os.path.getsize(out) if os.path.exists(out) else 0
    print("%-18s %6d B  %s" % (name, size, out))

async def main():
    jobs = []
    for k, t in INTROS.items(): jobs.append(gen("intro-" + k, t))
    for k, b in BIOS.items():   jobs.append(gen("alum-" + k, b))
    for coro in jobs:
        try:
            await coro
        except Exception as e:
            print("!! 失败:", e)
    print("--- 完成: %d 段 ---" % (len(jobs)))

if __name__ == "__main__":
    asyncio.run(main())
