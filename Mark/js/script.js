
document.addEventListener('DOMContentLoaded', ()=>{

    
    Cover.init()
    CanvasVideo.init()

    Section_Setting.init() // 섹션 높이 및 색상 매칭

    Scroll_Parallax.init() // 패럴랙스 래퍼 
    Scroll_Show.init()      // 모션 구현 래퍼
    
    Slider.init()   // 스와이퍼 셋팅
    
    Media_AutoPlay.init()   // 영상, 로띠 컨텐츠 셋팅
    
    /* 이미지 로드 후 불러오도록.... */
    let sectionBgLoadCount = 0;
    const sectionBgLoad = imagesLoaded( 'img' );
    sectionBgLoad.on( 'progress', function(instance, image) {
        sectionBgLoadCount++
        if(sectionBgLoadCount === sectionBgLoad.images.length){
            console.log('section img.section_bg loaded');
            document.body.classList.remove('load')
            init();
        }
    });
})


const marker = {
    parallax_bg: false,
    parallax_content: false,
    move_content: false,
    move_bg: false,
    media_active: false,
    swiper: false,
}

function init(){
    Cover.play() // 커버 재생 시작
}


/*========================================================================================================================= */
/*----------------- Section 설정 --------------------------------------------------------------------------- */
/*
- bg-wrapper 가 없는 경우 section의 높이 값을 직접 설정
    width: 1016 의 기준에 맞게 data-height 값을 % 로 치환하여 높이 설정

- bg-wrapper 가 없는 경우 높이 값 지정과 함께 배경 색상.. 지정 안하면 투명하게 제공
*/

const Section_Setting = (function(exports){
    function init(){
        document.querySelectorAll('.section').forEach((section,i)=>{
            if(!section.querySelector('.bg-wrapper')){
                const pt = Math.round( (section.dataset.height / 1016) * 100 )
                
                section.style.paddingTop = `${pt}%`;
            }
            section.dataset.bgcolor && (section.style.backgroundColor = section.dataset.bgcolor)
        })
    }

    exports.init = init;
    return exports;
})({})


/*========================================================================================================================= */
/*----------------- 커버 애니메이션 --------------------------------------------------------------------------------------- */
/*
- 커버 구성 요소를 확정하고 등록 방법을 통일 시킨다.
- 등록 순서대로 stagger 애니메이션이 일어나도록 통일 
- 커버는 세로 사이즈 꽉 차게 들어가야 한다.
- 동영상 , 로띠도 가능하게 설정 
*/
const Cover = (function(exports){
    let mediaLottie;
    let mediaVideo;

    function init(){

        gsap.set(".cover .content-wrapper:first-child > .content", {y: 60, autoAlpha: 0})
        gsap.set(".cover .content-wrapper:not(:first-child) > .content", {y: 40, autoAlpha: 0})

        document.querySelector('.cover .media-lottie') && lottie_init(".cover .media-lottie")
        document.querySelector('.cover .media-video') && video_init(".cover .media-video")
    }
    function lottie_init(e){
        elem = document.querySelector(e)
        mediaLottie =  lottie.loadAnimation({
            container: elem,
            loop: elem.dataset.loop ==="true" ? true : false,
            autoplay: false,
            path: elem.dataset.path
        })
    }
    function video_init(e){
        elem = document.querySelector(e)
        elem.classList.add("active")
        mediaVideo = elem.querySelector('video')
    }


    function play(){
        // const tl = gsap.timeline()
        gsap.to(".cover .content-wrapper .content", 2, {stagger: 0.5, y: 0, autoAlpha: 1, ease: "Quart.easeOut"})
        mediaVideo && mediaVideo.play()
        mediaLottie && mediaLottie.play()
    }

    exports.init = init;
    exports.play = play;
    return exports;
})({})




/*========================================================================================================================= */
/*----------------- 패럴랙스 이동 --------------------------------------------------------------------------------------- */
/*

data-palrallax ="true"
- cover 의 bg-wrapper 는 무조건 천천히 이동하게 설정 :: data-palrallax ="true"
- section 의 bg-wrapper 는 천천히 이동.
- section 의 content-wrapper 는 빠르게 이동.

section 의 content-wrapper 에 패럴랙스를 설정하면 공간감 있는 컨텐츠 배치 가능
*/

const Scroll_Parallax = (function(exports){

    function init(){
        /* bg-wrapper 에 설정된 경우 - 천천히 올라감 */
        document.querySelectorAll('.bg-wrapper[data-parallax="true"]').forEach( (elem, i) => {
            const isCover = (elem.parentElement.className.indexOf('cover') != -1) ? true : false; 
            const ani = gsap.fromTo(elem, 1, { 
                y: () => isCover ? 0 : "-40vh", 
            },{
                y: () => isCover ? "50vh" : "40vh",
                ease: 'none'
            });
            
            ScrollTrigger.create({
                markers: marker.parallax_bg,
                id: "parallaxBg",
                trigger: elem.parentElement, 
                animation: ani,
                start: () => isCover ?  "center center" : "top bottom", 
                // end: () => isCover ? ? "bottom top" : "200vh top",
                scrub: true,
            })
        });

        /* content-wrapper 에 설정된 경우 - 빠르게 올라감 */
        document.querySelectorAll('.content-wrapper[data-parallax="true"]').forEach( (elem, i) => {
            const ani = gsap.fromTo(elem, 1, { 
                y: '30vh', // 빠르게 이동하는 요소의 첫 위치
            },{
                y: '-50vh',
                ease: 'none' 
            })
            ScrollTrigger.create({
                markers: marker.parallax_content,
                id: "fast",
                trigger: elem.parentElement, 
                animation: ani,
                start: "top bottom", 
                scrub: .5,
            });
        });
    }

    exports.init = init;

    return exports;
})({})


/*========================================================================================================================= */
/*----------------- 특정 시점에 등장하는 모션 --------------------------------------------------------------------------------------- */
/*
data-motion = "true"
data-direction = "to-up" | "to-right" | "to-down" | "to-left"| "in-place"

- 모션을 적용할 것인지 여부를 판단하고 방향을 설정 : 방향 없이 제자리에서 등장하는 옵셔도 제공
- bg-wrapper 와 contnet-wrapper 의 이동 거리는 다르게 설정
:: content-wrapper 의 경우 대부분 텍스트 요소여서 bg와 다르게... ??
*/

function Animation(opts){
    const ani = gsap.fromTo(
        opts.elem, {
            x:()=>{
                if(opts.direction === "to-left")       return opts.gapLeft;
                else if(opts.direction === "to-right") return opts.gapRight;
                else if(opts.direction === "in-place")  return 0;
            },
            y:()=>{
                if(opts.direction === "to-up")         return opts.gapUp;
                else if(opts.direction === "to-down")  return opts.gapDown;
                else if(opts.direction === "in-place")  return 0;
            },
            autoAlpha: 0
        },
        {
            stagger: 0.2, x:0, y:0, autoAlpha: 1, 
            duration: 2,            //opts.duration,
            ease: 'Quart.easeOut'   // opts.ease
        });
    return ani;
}

function Trigger(opts){
    ScrollTrigger.create({
        id: 'show',
        ...opts,
    });

    /* ----- for reset -------- */
    /* 역스크롤 하면 다시 처음으로 셋팅 :: 모션 느낌 보기 위해 더미로 제작 */
    ScrollTrigger.create({
        markers: false,
        trigger: opts.trigger,
        id: "reset",
        onLeaveBack: () => opts.animation && opts.animation.pause(0)
    });
    /* -----------------------  */
}

const Scroll_Show = (function(exports){
    /* bg-wrapper 등장 모션 */
    function bg_show(){
        document.querySelectorAll('.bg-wrapper[data-motion="true"]').forEach( (elem, i)=>{
            const ani = Animation({
                elem: elem,
                direction: elem.dataset.direction,
                gapUp: '10vh',
                gapDown: '-10vh',
                gapRight: '-15vh',
                gapLeft: '15vh',
            })

            Trigger({
                markers: marker.move_bg && {endColor: "rgba(0,0,0,0)"},
                trigger: elem.parentElement,
                animation: ani,
                start: "top 80%", //=============================================================== 배경 등장 시점
            })
        })
    }

    /* content-wrapper등장 모션 */
    function content_show(){
        document.querySelectorAll('.content-wrapper[data-motion="true"]').forEach( (elem, i)=>{
            const ani = Animation({
                elem: elem.querySelectorAll('*'),
                direction: elem.dataset.direction,
                gapUp: 40,
                gapDown: -40,
                gapRight: -60,
                gapLeft: 60,
            })

            Trigger({                
                markers: marker.move_content && {endColor: "rgba(0,0,0,0)"},
                trigger: elem,
                animation: ani,
                start: "top 80%" //============================================================= 컨텐츠 등장 시점 
            })
        })
    }


    function init(){
        bg_show()
        content_show()
    }

    exports.init = init;
    return exports
})({})


/*========================================================================================================================= */
/*----------------- 스와이퍼 슬라이더 --------------------------------------------------------------------------------------- */
/*
- 자동 재생되는 타입과 아닌 타입 존재
- 밝은 ui 버전과 어두운 ui 버전으로 분기 처리 
*/

const Slider = (function(exports){

    function init(){
        document.querySelectorAll(".slider").forEach((slider, i)=>{
            createSlider(slider)
        });
    }

    function createSlider(slider){
        const wrapper = slider.parentElement;
        const swiperContainer = slider.querySelector(".swiper-container");
        const pagination = slider.querySelector(".pagination");
        const prev = slider.querySelector(".prev");
        const next = slider.querySelector(".next");

        const autoplay = slider.getAttribute("data-autoplay")

        const swiper = new Swiper(swiperContainer,{
            loop: autoplay == "true",
            autoplay: autoplay == "true" && {
                delay: 2500, // ========================================================= 스와이퍼 자동 재생 타임
                disableOnInteraction: true
            },
            speed: 800, //=============================================================== 스와이퍼 스피드 
            pagination: { el: pagination },
            navigation: { nextEl: next , prevEl: prev, },
        });

        autoplay && ScrollTrigger.create({
            markers: marker.swiper,
            trigger: wrapper,
            start: "top bottom",
            end: "bottom top",
            onEnter:()=>{
                swiper.slideTo(1, 50)
                swiper.autoplay.paused = false
                swiper.autoplay.start()
            }
        })
    }

    exports.init = init;
    return exports;
})({})



/*========================================================================================================================= */
/*----------------- 미디어 셋팅 : 캔버스 비디오 --------------------------------------------------------------------------------------- */
/*
*/

const CanvasVideo = (function(exports){
    function init(){
        document.querySelectorAll('.media-video').forEach((e, i)=>{
            canvasVideo(e)
        });
        
        function canvasVideo(e){
            const canvas = e.querySelector('canvas');
            const video = e.querySelector('video');
            // video.src = video.getAttribute("data-src");
            e.dataset.loop == "true" && (video.setAttribute('loop', true))
            e.dataset.autoplay == "true" && (video.setAttribute('autoplay', true))
            
            const ctx = canvas.getContext("2d");
            video.addEventListener('loadeddata', ev => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight; 
                function drawCanvas() {
                    if( !e.classList.contains("active") ) return
                    ctx.drawImage(video, 0, 0, canvas.width , canvas.height );
                    window.requestAnimationFrame(drawCanvas);
                };
                // setInterval((function(){ drawCanvas() }), 1000/24);
                // drawCanvas();
                window.requestAnimationFrame(drawCanvas);
            })
        };
    }
    exports.init = init;
    return exports;
})({})



/*========================================================================================================================= */
/*----------------- 미디어 자동재생 일 경우, 재생 시점 -------------------------------------------------------------------- */
/*
미디어의 경우 재생 시점을 브라우저 100% ?? : 80% ???
*/
const Media_AutoPlay = (function(exports){

    function init(){
        /* 미디어 - 동영상 타입 */
        document.querySelectorAll('.section .media-video').forEach((e, i)=>{
            if(e.dataset.autoplay === "true"){
                Trigger({                
                    markers: marker.media_active && {endColor: "rgba(0,0,0,0)"},
                    trigger: e.parentElement,
                    start: "top 80%", //============================================================= 비디오 자동재생 플레이 시점 
                    onEnter:()=>{
                        e.classList.add('active')

                        const canvas = e.querySelector('canvas');
                        const video = e.querySelector('video');
                        const ctx =  canvas.getContext("2d");
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;

                        function drawCanvas(){
                            if( !e.classList.contains("active") ) return
                            ctx.drawImage(video, 0, 0, canvas.width , canvas.height );
                            window.requestAnimationFrame(drawCanvas);
                        }

                        video.play()
                        window.requestAnimationFrame(drawCanvas);
                    }
                });
            }
        });

        /* 미디어 - 로띠 타입  */
        document.querySelectorAll('.section .media-lottie').forEach((e, i)=>{
            const $lottie = lottie.loadAnimation({
                container: e,
                renderer: 'svg',
                loop: e.dataset.loop === "true" ? true : false,
                autoplay: false,
                path: e.dataset.path,
            })

            Trigger({                
                markers: marker.media_active && {endColor: "rgba(0,0,0,0)"},
                trigger: e,
                start: "top 80%", //============================================================= 로띠 자동재생 시점
                onEnter:()=>{
                    $lottie.play()
                }
            });
            
        });
    }

    exports.init = init;
    return exports;
})({})
