# 拼音小火车素材说明

- `assets/posters/*.png`：家长提供的五张学习图，原样复制。对应声母、单韵母和复韵母、鼻韵母和特殊韵母、整体认读、声调。
- `assets/train-forest.png`：本项目使用内置 image_gen 生成的原创森林小火车插画。提示词见项目的 `ARTWORK.md`。
- `assets/audio/*.mp3`：来自 [cmguo/PinYinSound](https://github.com/cmguo/PinYinSound)，下载日期 2026-09-14。按源文件名保留，`v`、`ve`、`vn` 分别对应 `ü`、`üe`、`ün`。这是拼音发音素材，不是将拉丁字母交给普通文字朗读引擎。该仓库未声明素材的再分发许可证，不能把它当作已获开源授权的音频库；本次用于个人家庭试玩，公开分发或商用前应取得许可或替换成有明确授权的录音。
- `assets/voice/*.wav`：本地 Windows 中文语音合成生成的游戏引导、鼓励语音，不用于模拟拼音音素。
- `assets/restaurant/voice/*.wav`：本地 Windows 中文语音合成生成的动物餐厅点餐、玩法和反馈语音，不用于模拟拼音音素。
- `assets/Andika-Regular.ttf`：Andika，由 SIL International 发布，采用 SIL Open Font License 1.1；许可证在 `assets/Andika-OFL.txt`。来源：[Google Fonts / Andika](https://github.com/google/fonts/tree/main/ofl/andika)。

学习内容依照家长的学习图整理：23 个声母、14 个单/复韵母、10 个鼻韵母/特殊韵母、16 个整体认读音节，以及 6 个单韵母和 ba 的四声（28 个声调题目）。标调规则保留在复习页和原始图片中，本版不包含标调位置的独立闯关。

发音素材不是教育主管部门认证的教材音频；本版验证文件完整性、浏览器可播放性和文件与题目的映射，建议家长陪玩时试听，尤其是声母呼读音与轻短本音的区别。

动物餐厅使用同一套本地拼音 MP3 播放食物和拼读；餐厅自己的语音引导和装饰进度与小火车的奖励、`localStorage` 存档分开保存。
