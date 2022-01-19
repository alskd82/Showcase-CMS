
document.addEventListener('DOMContentLoaded', ()=>{
    let sectionBgLoadCount = 0;
    const sectionBgLoad = imagesLoaded( 'img' );
    sectionBgLoad.on( 'progress', function(instance, image) {
        sectionBgLoadCount++
        if(sectionBgLoadCount === sectionBgLoad.images.length){
            console.log('section img.section_bg loaded');
            init();
        }
    });
})


const marker = {
    parallax_bg: false,
    content_speed_fast: false,
    content_move: false,
    bg_move: false,
}

function init(){

    SectionHeight()

    Scroll_Parallax.init()
    Scroll_Show.init()

    Cover.init()
    Cover.play()

    Slider.init()
}



/*========================================================================================================================= */
/*----------------- [ bg-wrapper ] 가 없는 섹션은--------------------------------------------------------------------------------------- */
/*
- 배경 이미지나 영상 없이 content-wrapper 만 있는 경우,
    1016 * 1624 비율에 맞게 빈공간을 조성
- 섹션의 배경 컬러 지정... 배경이 없는데 기본 색상을 다른 색으로 써야할 때... => 색상이 들어간 이미지를 전체에 깔기에는...??

*/
function SectionHeight(){
    document.querySelectorAll('.section').forEach((section,i)=>{
        !section.querySelector('.bg-wrapper') && section.classList.add('padding-top')
        section.getAttribute('data-bgcolor') && (section.style.backgroundColor = section.getAttribute('data-bgcolor'))
    })
}

/*========================================================================================================================= */
/*----------------- 커버 애니메이션 --------------------------------------------------------------------------------------- */
/*

- 커버 구성 요소를 확정하고 등록 방법을 통일 시킨다.
- 커버는 가로 사이즈 꽉 차게 들어가야 한다.
- 동영상 , 로띠도 가능하게 설정 

*/
const Cover = (function(exports){
    const brand = document.querySelector('.cover .content-wrapper :nth-child(1)')
    const title = document.querySelector('.cover .content-wrapper :nth-child(2)')
    const num = document.querySelector('.cover .content-wrapper :nth-child(3)')
    function init(){
        gsap.set(brand, { y: 60, autoAlpha: 0 })
        gsap.set(title, { y: 30, autoAlpha: 0 })
        gsap.set(num, { y: 40, autoAlpha: 0  })
    }
    function play(){
        const tl = gsap.timeline()
        tl.to(brand, 2, {y: 0, autoAlpha:1, ease: "Quart.easeOut"})
            .to(title, 2, {y: 0, autoAlpha:1, ease: "Quart.easeOut"}, "=-1.5")
            .to(num, 2, {y: 0, autoAlpha:1, ease: "Quart.easeOut"}, "=-1.5")
    }

    exports.init = init;
    exports.play = play;
    return exports;
})({})




/*========================================================================================================================= */
/*----------------- 스크롤 양에 따른 이동 --------------------------------------------------------------------------------------- */
/*

data-palrallaxbg ="true"
- 커버의 bg-wrapper 는 무조건 천천히 이동하게 설정 :: data-palrallaxbg ="true"
- 섹션의 bg-wrapper 는 옵션으로 제공.

data-speed = "fast"
- 섹션의 content-wrapper 중에 빠르게 배경보다 빠르게 이동하는 효과제공
    공간감 있는 컨텐츠 배치가 가능

*/

const Scroll_Parallax = (function(exports){

    function init(){
        /* 배경 요소 천천히 올라가는 경우 */
        document.querySelectorAll('.bg-wrapper[data-parallaxbg="true"]').forEach( (elem, i) => {
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

        /* 컨텐츠 요소 빠르게 올라가는 경우 */
        document.querySelectorAll('.content-wrapper[data-speed="fast"]').forEach( (elem, i) => {
            const ani = gsap.fromTo(elem, 1, { 
                y: '30vh', // 빠르게 이동하는 요소의 첫 위치
            },{
                y: '-50vh',
                ease: 'none' 
            })
            ScrollTrigger.create({
                markers: marker.content_speed_fast,
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


// 스크롤 특정 시점에 반응해서 등장하는 요소//
/*
배경 요소와 컨텐츠 요소를 분기처리하여
이동거리와 속도, 트리거 시점 차이를 둔다.
*/

/*========================================================================================================================= */
/*----------------- 특정 시점에 등장하는 모션 --------------------------------------------------------------------------------------- */
/*

data-motion = "true"
data-direction = "up" | "right" | "down" | "left"| "none"

- 모션을 적용할 것인지 여부를 판단하고 방향을 설정 : 방향이 없으면 제자리에서 등장
- bg-wrapper 와 contnet-wrapper 에 적용되는 시점을 달리 설정.

*/

const Scroll_Show = (function(exports){
    function Animation(opts){
        const ani = gsap.fromTo(
            opts.elem, {
                x:()=>{
                    if(opts.direction === "left")       return opts.gapLeft;
                    else if(opts.direction === "right") return opts.gapLeft;
                    else if(opts.direction === "none")  return 0;
                },
                y:()=>{
                    if(opts.direction === "up")         return opts.gapUp;
                    else if(opts.direction === "down")  return opts.gapDown;
                    else if(opts.direction === "none")  return 0;
                },
                autoAlpha: 0
            },
            {
                stagger: 0.2, x:0, y:0, autoAlpha: 1, 
                duration: opts.duration,
                ease: opts.ease
            });
        return ani;
    }

    function ST(opts){
        ScrollTrigger.create({
            id: 'move',
            ...opts,
        });

        /** for reset **/
        ScrollTrigger.create({
            markers: false,
            trigger: opts.trigger,
            id: "reset",
            onLeaveBack: () => opts.animation.pause(0)
        });
        /* -----------  */
    }

    /* 배경 요소 등장 모션 */
    function bg_show(){
        document.querySelectorAll('.bg-wrapper[data-motion="true"]').forEach( (elem, i)=>{
            const ani = Animation({
                elem: elem,
                direction: elem.dataset.direction,
                duration: 2,
                ease: 'Quart.easeOut',
                gapUp: '10vh',
                gapDown: '-10vh',
                gapRight: '-10vh',
                gapLeft: '10vh',
            })

            ST({
                markers: marker.bg_move && {endColor: "rgba(0,0,0,0)"},
                trigger: elem.parentElement,
                animation: ani,
                start: "top 80%", //=============================================================== 배경 등장 시점
            })
        })
    }

    /* 컨텐츠 요소 등장 모션 */
    function content_show(){
        document.querySelectorAll('.content-wrapper[data-motion="true"]').forEach( (elem, i)=>{
            const ani = Animation({
                elem: elem.querySelectorAll('div'),
                direction: elem.dataset.direction,
                duration: 2,
                ease: 'Quart.easeOut',
                gapUp: '5vh',//40,
                gapDown: -40,
                gapRight: -40,
                gapLeft: 40,
            })

            ST({
                trigger: elem.parentElement,
                markers: marker.content_move && {endColor: "rgba(0,0,0,0)"},
                animation: ani,
                start: "top center" //============================================================= 컨텐츠 등장 시점 
            })
        })
    }

    

    function init(){
        content_show()
        bg_show()
    };
    
    exports.init = init;
    return exports;
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
        const section = slider.parentElement;
        const swiperContainer = slider.querySelector(".swiper-container");
        const pagination = slider.querySelector(".pagination");
        const prev = slider.querySelector(".prev");
        const next = slider.querySelector(".next");

        const autoplay = slider.getAttribute("data-autoplay")

        const swiper = new Swiper(swiperContainer,{
            loop: autoplay == "true",
            autoplay: autoplay == "true" && {
                delay: 2000, // ========================================================= 스와이퍼 자동 재생 타임
                disableOnInteraction: true
            },
            speed: 600, //=============================================================== 스와이퍼 스피드 
            pagination: { el: pagination },
            navigation: { nextEl: next , prevEl: prev, },
        });

        autoplay && ScrollTrigger.create({
            markers: false,
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            onEnter:()=>{
                swiper.slideTo(1, 50)
                requestAnimationFrame((function() {
                    swiper.autoplay.paused = false
                    swiper.autoplay.start()
                }))
            }
        })
    }

    exports.init = init;
    return exports;
})({})


