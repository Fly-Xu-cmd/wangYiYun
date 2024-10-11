// 导包
import { PlayerCoverBackMode, playerListRender } from "../home/control.js";
import { getAudioInfo, getAudioLyric } from "../service/ajax.js";
import { reactive } from "../util/reactive.js";
import { blur, formatSongLyric } from "../util/util.js";

// 初始化歌曲对象
const music = {
  data: [],
  lyric: [],
};

// 初始化响应式音乐对象
const musicDataProxy = reactive(
  {
    musicId: 1813926556,
  },
  initPlayer
);

export async function playerPage({ params: id = "" }) {
  document.querySelector("#app").innerHTML = "playerPage加载中";
  changePlayerMusicId(id);
  // 更改歌曲是否返回推荐列表详情页还是去播放列表
  const lastRecommendId = window.localStorage.getItem("lastRecommendId");
  PlayerCoverBackMode(JSON.parse(localStorage.getItem('backPage')), lastRecommendId);
}

export async function changePlayerMusicId(musicId) {
  const id = musicId;
  const musicData = await getAudioInfo(id);
  const musicLyric = await getAudioLyric(id);
  music.data = musicData;
  // 初始化播放器歌词
  music.lyric = formatSongLyric(musicLyric.lrc.lyric);
  musicDataProxy.musicId = id;
  // 更新跳转页面
  const lastRecommendId = window.localStorage.getItem("lastRecommendId");
  PlayerCoverBackMode(JSON.parse(localStorage.getItem('backPage')), lastRecommendId);
}

/**
 * @description: 初始化播放器播放页面
 * @param {*}
 * @return {*}
 */
async function initPlayer() {
  let songInfo = music.data.songs[0];
  document.querySelector("#app").innerHTML = `
    <div class="player-background-image">
        <div class="player-content d-flex">
            <div class="player-album-cover d-flex">
                <!-- 歌曲封面 -->
                <div class="ablum">
                    <div class="cover running">
                        <img src="${songInfo.al.picUrl}" alt="">
                    </div>
                </div>
            </div>

            <div class="player-lyric d-flex align-items-start">
                <!-- 歌曲和歌词信息 -->
                <h3 class="song-name">
                ${songInfo.name}
                </h3>
                <div class="song-info">
                    <span class="song-album">专辑：${songInfo.al.name}</span>
                    <span class="singer">歌手：${songInfo.ar[0].name}</span>
                    <span class="song-sour">来源：${songInfo.al.name}</span>
                </div>
                <div class="lyric-wrap">
                ${initLyric(music.lyric)}
                </div>
            </div>
        </div>
    </div>
    <div class='player-list-div display-none'>
      <h3 class='player-list-header'>播放列表</h3>
      <ul class='player-list-ul'>
        <!-- 播放器列表需要动态生成 -->
      </ul>
    </div>
    `;
  initPlayerEvent();
  imgBlur();
  setTimeout(() => { playerListRender(); }, 500)
}

/**
 * @description: 添加高斯模糊后的背景图
 * @param {*}
 * @return {*}
 */
function imgBlur() {
  const imgBox = document.querySelector(".player-background-image");
  let imgSrc = music.data.songs[0].al.picUrl;
  blur(imgBox, imgSrc);
}

// 监听歌曲播放和歌词滚动
function initPlayerEvent() {
  const audio = document.querySelector("#myAudio");
  audio.addEventListener("timeupdate", (e) => {
    // 获得音乐播放当前的时间
    const lyricItem = document.querySelectorAll(".song-lyric-item");
    if (!lyricItem.length) return;
    const currentTime = e.target.currentTime;
    let i = 0;
    Array.from(lyricItem).forEach((item) => {
      const time = item.getAttribute("data-time");
      if (currentTime > time) i++;
      item.classList.remove("active");
    });
    if (i >= 1) lyricItem[i - 1].classList.add("active");
    if (i > 5) {
      setScrollTop("lyric-wrap", "song-lyric-item", i - 1 - 5);
    }
  });
  audio.addEventListener("ended", () => {
    const ablumCover = document.querySelector(".ablum .cover");
    if (!ablumCover) return;
    ablumCover.style.animationPlayState = "paused";
  });
  audio.addEventListener("pause", () => {
    const ablumCover = document.querySelector(".ablum .cover");
    if (!ablumCover) return;
    ablumCover.style.animationPlayState = "paused";
  });
  audio.addEventListener("playing", () => {
    const ablumCover = document.querySelector(".ablum .cover");
    if (!ablumCover) return;
    ablumCover.style.animationPlayState = "running";
  });
}

/**
 * @description: 滚动条自动滑动的距离
 * @param {*} className
 * @param {*} target
 * @param {*} index
 * @return {*}
 */
function setScrollTop(className, target, index) {
  const ele = document.querySelector(`.${className}`);
  if (typeof target == "number") {
    ele.scrollTop = index * target;
  } else if (typeof target == "string") {
    const { height } = document
      .querySelector(`.${target}`)
      .getBoundingClientRect();
    ele.scrollTop = index * height;
  } else if (target instanceof HTMLElement) {
    const { height } = target.getBoundingClientRect();
    ele.scrollTop = index * height;
  }
}

/**
 * @description: 动态添加歌词
 * @param {*} lyricData
 * @return {*}
 */
function initLyric(lyricData) {
  if (lyricData.length == 0) return "";
  let tempStr = "";
  lyricData.forEach((item) => {
    tempStr += `
        <p class="song-lyric-item" data-time='${item.time}'>${Object.keys(item).length > 0 ? item.lyric : ""
      }</p>
        `;
  });
  return tempStr;
}