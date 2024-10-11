// 导包
import Ajax from '../service/ajax.js'
import { debounce } from "../util/util.js";

// 切换箭头为静态 HTML 样式，无需根据图片数量动态生成。
const carouselControl = `
<button class="carousel-control carousel-control-left carousel-control-hover">
<svg class="icon" aria-hidden="true">
    <use xlink:href="#icon-arrow-left"></use>
</svg>
</button>
<button class="carousel-control carousel-control-right carousel-control-hover">
<svg class="icon" aria-hidden="true">
    <use xlink:href="#icon-arrow-right"></use>
</svg>
</button>
`;

//轮播图配置
const carousel = {
  data: [], //轮播图数据
  currentIndex: 2, //轮播图当前切换的画面
  times: 2000, //轮播图多少时间切换画面
  animationTimes: 0.5, //轮播图动画持续时间，单位s
  autoCycleTimer: new Set() //如果在切换动画，无法进行切换画面
};

//动态渲染轮播图
export function carouselRender(data) {
  //初始化轮播图
  let carouselItem = "",
    carouselIndicatorsLi = "";
  const wrapper = document.querySelector(".carousel-wrapper");
  if (wrapper) {
    let { width = 0 } = wrapper.getBoundingClientRect(); //得到图片的宽度
    //动态生成轮播图
    data.forEach((item, index) => {
      //指示器激活选中判断
      let isActive = carousel.currentIndex == index ? "active" : "";
      //动态生成轮播图图片，并给每一张图片加上偏移量和动画效果
      carouselItem += `
              <div class="carousel-item #${index
        }" style='transform:translateX(${width * (index - 2)
        }px);transition-duration:${carousel.animationTimes}s'>
                  <img src="${item.pic}" alt="">
              </div>
              `;
      //动态生成轮播图指示器
      carouselIndicatorsLi += `
                  <li data-slide-to="${index}" class="carousel-indicators-li ${isActive - 2}"></li>
              `;
    });
    // 通过模板字符串，按照 home.html 中的 html 结构进行排布
    const carouselContainer = `
          <div class="carousel-container" style="transition:transform ${carousel.animationTimes}s ">
              ${carouselControl}
              <div class="carousel-content">
                  ${carouselItem}
              </div>
          </div>
          `;
    const carouselIndicators = `
          <ul class="carousel-indicators d-flex">
              ${carouselIndicatorsLi}
          </ul>
          `;
    // 将得到的字符串通过 innerHTML 插入到轮播图盒子
    wrapper.innerHTML = carouselContainer + carouselIndicators;
    // 通过定时器开启自动轮播,每过一段时间调用 getNext 方法
    clearAllTimer();
    let timer = setInterval(getNext, carousel.times);
    carousel.autoCycleTimer.add(timer);
  }
}

//轮播图数据请求
Ajax({
  url: "/homepage/block/page",
}).then((res) => {
  carousel.data = res.data.blocks[0].extInfo.banners;
  //首次渲染轮播图
  carouselRender(carousel.data);
});

// 切换到上一张
function getPrev() {
  // 获取到轮播图每一项的图片容器
  const carouselItems = document.getElementsByClassName('carousel-item');
  let length = carouselItems.length;
  // 当后退到第一张时，重置为总长度，防止index变为负数导致bug
  carousel.currentIndex == 0 && (carousel.currentIndex = length);
  // 每调用一次 getPrev，序号-1
  let index = carousel.currentIndex = --carousel.currentIndex % length;
  // 将类数组转变为数组
  let newArr = Array.from(carouselItems);
  //调换数组顺序
  newArr = [...newArr.slice(index), ...newArr.slice(0, index)]
  // 计算得到轮播图每一项的图片容器的宽度
  let { width = 0 } = getElementRect(carouselItems[0]);
  // 轮播图数组移动
  newArr.forEach((item, i) => {
    // 轮播每次向右移动一个单位宽度
    item.style.transform = `translateX(${width * (i)}px)`;
    item.style.index = 1;
    if (i == length - 1) {
      item.style.zIndex = -1;
      item.style.transform = `translateX(${-width}px)`;
    }
  });
  setTimeout(() => {
    newArr[length - 1].style.zIndex = 1;
  }, 500)
  // 指示器移动
  indicatorsRender(index);
}

// 切换到下一张
function getNext() {
  const carouselItems = document.getElementsByClassName('carousel-item');
  let length = carouselItems.length;
  let index = carousel.currentIndex = ++carousel.currentIndex % length;
  let newArr = Array.from(carouselItems);
  if (carouselItems[0]) {
    let { width = 0 } = getElementRect(carouselItems[0]);
    // 轮播图数组移动
    newArr = [...newArr.slice(index - 2), ...newArr.slice(0, index - 2)];
    newArr.forEach((item, i) => {
      item.style.zIndex = 1;
      item.style.transform = `translateX(${width * (i - 2)}px)`;
    });
    new Promise((resolve) => {
      setTimeout(() => {
        newArr[0].style.zIndex = -1;
        resolve();
      }, 500);
    }).then(() => {
      setTimeout(() => {
        newArr[0].style.transform = `translateX(${width * (length - 1)}px)`;
      }, 500);
    });
    // 指示器移动
    indicatorsRender(index);
  } else clearAllTimer();

}

// 指示器渲染
function indicatorsRender(index) {
  // 获取到轮播图每一项的指示器
  const indicators = document.getElementsByClassName('carousel-indicators-li');
  if (index - 3 >= 0) {
    index = index - 3;
  } else {
    index = index - 3 + indicators.length;
  }
  Array.from(indicators).forEach((item, i) => {
    if (index == i) { // 当 index 和指示器下标相同添加active类
      item.setAttribute('class', 'carousel-indicators-li active')
    } else {
      item.setAttribute('class', 'carousel-indicators-li')
    }
  })
}

// 获取元素的宽高
function getElementRect(ele) {

  return ele.getBoundingClientRect();
}
// 左箭头事件处理函数
function leftHandle() {
  //左切换箭头事件处理
  //清空定时器暂停轮播
  clearAllTimer();
  //切换到前一张
  getPrev();
  //开启定时器继续轮播，并将定时器加入到定时器保存器中
  let timer = setInterval(getNext, carousel.times);
  carousel.autoCycleTimer.add(timer);
}

// 右箭头事件处理函数
function rightHandle() {
  //右切换箭头事件处理
  clearAllTimer();
  getNext();
  let timer = setInterval(getNext, carousel.times);
  carousel.autoCycleTimer.add(timer);
}


// 给左右箭头函数添加防抖函数
const leftHandleDebounce = debounce(leftHandle, 500);
const rightHandleDebounce = debounce(rightHandle, 500);

// 初始化轮播事件
export function initCarouselEvent() {
  const leftControl = document.getElementsByClassName("carousel-control-left");
  const rightControl = document.getElementsByClassName("carousel-control-right");
  const carouselContainer = document.querySelector(".carousel-container");
  // const indicatorsWrapper = document.querySelector(".carousel-indicators");
  // 左右箭头切换事件
  leftControl[0].addEventListener("click", leftHandleDebounce);
  rightControl[0].addEventListener("click", rightHandleDebounce);
  // 移入移出控制轮播播放事件
  carouselContainer.addEventListener("mouseenter", () => {
    //移入轮播图通过移除定时器达到轮播图暂停的目的
    clearAllTimer();
  });

  carouselContainer.addEventListener("mouseleave", () => {
    //移出轮播图通过设置定时器达到开启轮播图轮播的目的
    clearAllTimer();
    let timer = setInterval(getNext, carousel.times);
    carousel.autoCycleTimer.add(timer);
  });
  // //指示器事件处理函数：通过事件委托到父级容器 ul，减少对每个指示器添加事件监听
  // indicatorsWrapper.addEventListener("mouseenter", (e) => {
  //   if (e.target.tagName === "LI") {
  //     clearAllTimer();
  //     // 得到每个指示器的序号
  //     const index = e.target.getAttribute("data-slide-to") - 5;
  //     // 序号-1，调用getNext会+1，两者相抵消，根据序号指定到对应的图片
  //     carousel.currentIndex = index - 1;
  //     getNext();
  //     clearAllTimer();
  //     let timer = setInterval(getNext, carousel.times);
  //     carousel.autoCycleTimer.add(timer);
  //   }
  // },
  //   true
  // );
}
function clearAllTimer() {
  if (carousel.autoCycleTimer.size > 0) {
    for (const i of carousel.autoCycleTimer) {
      clearInterval(Number(i));
    }
    carousel.autoCycleTimer.clear();
  }
}

