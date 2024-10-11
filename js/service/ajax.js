// 基础地址
const BASE_URL = "http://localhost:3000";

/**
 * @description: 封装的ajax请求函数
 * @param {{method:string,url:string,data:object}} 封装的请求参数
 * @returns 
 */
export default function Ajax({
  //请求参数配置
  method = "GET", //默认为'get'请求
  url,
  data = {},
}) {
  return new Promise((resolve, reject) => {
    // 通过 Promise 返回异步请求
    const xhr = new XMLHttpRequest();
    xhr.open(method, BASE_URL + url);
    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        // 请求成功
        resolve(JSON.parse(xhr.response));
      } else {
        // 请求失败,返回状态码和状态文本
        reject(`请求失败，状态码：${xhr.status}，状态文本：${xhr.statusText}`);
      }

    };
    xhr.onerror = function () {
      // 待最后进行错误处理操作
      if (xhr.status == 0) {
        reject("请求失败，网络连接异常");
      }
    };
    if (method.trim().toUpperCase() === 'GET') {
      xhr.send();
    } else if (method.trim().toUpperCase() === 'POST') {
      xhr.send(JSON.stringify(data));
    } else {
      console.log('非GET或POST请求');
    }

  });
}

/**
 * @description: 获得轮播图信息
 * @param {*}
 * @return {*}
 */
export async function getBannerList() {
  const result = Ajax({
    url: `/homepage/block/page`,
  });
  return result;
}

/**
 * @description: 获得推荐歌单列表
 * @param {*} musicId
 * @return {*}
 */
export async function getRecommendList(musicId) {
  const result = Ajax({
    url: `/playlist/detail?id=${musicId}`,
  });
  return result;
}

/**
 * @description: 获得音乐的播放地址
 * @param {*} musicId
 * @return {*}
 */
export async function getAudioSrc(musicId) {
  let result = `https://music.163.com/song/media/outer/url?id=${musicId}`;
  return result;
}

/**
 * @description: 获得歌曲信息
 * @param {*} musicId
 * @return {*}
 */
export async function getAudioInfo(musicId) {
  const result = Ajax({
    url: `/song/detail?ids=${musicId}`,
  });
  return result;
}

/**
 * @description: 获得歌曲歌词
 * @param {*} musicId
 * @return {*}
 */
export async function getAudioLyric(musicId) {
  const result = Ajax({
    url: `/lyric?id=${musicId}`,
  });
  return result;
}