import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './landing.css';

export default function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize the page exactly like the templates
    const doc = document.documentElement;
    doc.classList.remove('no-js');
    doc.classList.add('js');

    // Moving objects functionality from Laurel
    const movingObjects = document.querySelectorAll('.is-moving-object');

    function throttle(func: (...args: unknown[]) => void, milliseconds: number) {
      let lastEventTimestamp: number | null = null;
      const limit = milliseconds;

      return (...args: unknown[]) => {
        const now = Date.now();
        if (!lastEventTimestamp || now - lastEventTimestamp >= limit) {
          lastEventTimestamp = now;
          func.apply(this, args);
        }
      };
    }

    let mouseX = 0;
    let mouseY = 0;
    let scrollY = 0;
    let coordinateX = 0;
    let coordinateY = 0;
    const winW = window.innerWidth;
    const winH = window.innerHeight;

    function moveObjects(e: MouseEvent, object: NodeListOf<Element>) {
      mouseX = e.pageX;
      mouseY = e.pageY;
      scrollY = window.scrollY;
      coordinateX = (winW / 2) - mouseX;
      coordinateY = (winH / 2) - (mouseY - scrollY);

      for (let i = 0; i < object.length; i++) {
        const element = object[i] as HTMLElement;
        const translatingFactor = parseInt(element.getAttribute('data-translating-factor') || '20');
        const rotatingFactor = parseInt(element.getAttribute('data-rotating-factor') || '20');
        const perspective = parseInt(element.getAttribute('data-perspective') || '500');
        const transformProperty: string[] = [];

        if (element.classList.contains('is-translating')) {
          transformProperty.push(`translate(${coordinateX / translatingFactor}px, ${coordinateY / translatingFactor}px)`);
        }

        if (element.classList.contains('is-rotating')) {
          transformProperty.push(`perspective(${perspective}px) rotateY(${-coordinateX / rotatingFactor}deg) rotateX(${coordinateY / rotatingFactor}deg)`);
        }

        if (element.classList.contains('is-translating') || element.classList.contains('is-rotating')) {
          element.style.transform = transformProperty.join(' ');
          element.style.transition = 'transform 1s ease-out';
          element.style.transformStyle = 'preserve-3d';
          element.style.backfaceVisibility = 'hidden';
        }
      }
    }

    if (movingObjects.length > 0) {
      window.addEventListener('mousemove', throttle(
        function (e: MouseEvent) {
          moveObjects(e, movingObjects);
        },
        150
      ));
    }

    // Device mockup loading animation
    const deviceMockup = document.querySelector('.device-mockup') as HTMLImageElement;
    if (deviceMockup) {
      function deviceMockupLoaded() {
        deviceMockup.classList.add('has-loaded');
      }

      if (deviceMockup.complete) {
        deviceMockupLoaded();
      } else {
        deviceMockup.addEventListener('load', deviceMockupLoaded);
      }
    }

    // Venus particle animation
    const heroParticlesCanvas = document.getElementById('hero-particles') as HTMLCanvasElement;
    if (heroParticlesCanvas) {
      class Bubble {
        parentNode: HTMLElement;
        canvasWidth: number;
        canvasHeight: number;
        mouseX: number;
        mouseY: number;
        translateX: number;
        translateY: number;
        posX: number;
        posY: number;
        movementX: number;
        movementY: number;
        color: string;
        alpha: number;
        size: number;
        velocity: number;
        smoothFactor: number;
        staticity: number;
        magnetism: number;

        constructor(parentNode: HTMLElement) {
          this.parentNode = parentNode;
          this.getCanvasSize();
          this.mouseX = 0;
          this.mouseY = 0;
          this.randomise();
        }

        getCanvasSize() {
          this.canvasWidth = this.parentNode.clientWidth;
          this.canvasHeight = this.parentNode.clientHeight;
        }

        generateDecimalBetween(min: number, max: number) {
          return parseFloat((Math.random() * (min - max) + max).toFixed(2));
        }

        update() {
          this.translateX = this.translateX - this.movementX;
          this.translateY = this.translateY - this.movementY;
          this.posX += ((this.mouseX / (this.staticity / this.magnetism)) - this.posX) / this.smoothFactor;
          this.posY += ((this.mouseY / (this.staticity / this.magnetism)) - this.posY) / this.smoothFactor;

          if (this.translateY + this.posY < 0 || this.translateX + this.posX < 0 || this.translateX + this.posX > this.canvasWidth) {
            this.randomise();
            this.translateY = this.canvasHeight;
          }
        }

        randomise() {
          const colors = ['85,107,139', '38,141,247', '66,52,248', '255,108,80', '243, 244, 255', '96, 100, 131'];
          this.velocity = 30;
          this.smoothFactor = 50;
          this.staticity = 30;
          this.magnetism = 0.1 + Math.random() * 4;
          this.color = colors[Math.floor(Math.random() * colors.length)];
          this.alpha = this.generateDecimalBetween(5, 10) / 10;
          this.size = this.generateDecimalBetween(1, 4);
          this.posX = 0;
          this.posY = 0;
          this.movementX = this.generateDecimalBetween(-2, 2) / this.velocity;
          this.movementY = this.generateDecimalBetween(1, 20) / this.velocity;
          this.translateX = this.generateDecimalBetween(0, this.canvasWidth);
          this.translateY = this.generateDecimalBetween(0, this.canvasHeight);
        }
      }

      class Background {
        canvas: HTMLCanvasElement;
        ctx: CanvasRenderingContext2D;
        dpr: number;
        w: number;
        h: number;
        wdpi: number;
        hdpi: number;
        bubblesList: Bubble[];

        constructor(canvas: HTMLCanvasElement) {
          this.canvas = canvas;
          this.ctx = canvas.getContext('2d')!;
          this.dpr = window.devicePixelRatio;
          this.bubblesList = [];
        }

        start() {
          this.canvasSize();
          window.addEventListener('resize', () => this.canvasSize());
          this.generateBubbles();
          this.animate();
        }

        canvasSize() {
          const container = this.canvas.parentNode as HTMLElement;
          this.w = container.offsetWidth;
          this.h = container.offsetHeight;
          this.wdpi = this.w * this.dpr;
          this.hdpi = this.h * this.dpr;
          this.canvas.width = this.wdpi;
          this.canvas.height = this.hdpi;
          this.canvas.style.width = this.w + 'px';
          this.canvas.style.height = this.h + 'px';
          this.ctx.scale(this.dpr, this.dpr);
        }

        animate() {
          this.ctx.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
          this.bubblesList.forEach((bubble) => {
            bubble.update();
            this.ctx.translate(bubble.translateX, bubble.translateY);
            this.ctx.beginPath();
            this.ctx.arc(bubble.posX, bubble.posY, bubble.size, 0, 2 * Math.PI);
            this.ctx.fillStyle = `rgba(${bubble.color},${bubble.alpha})`;
            this.ctx.fill();
            this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
          });
          requestAnimationFrame(this.animate.bind(this));
        }

        generateBubbles() {
          for (let i = 0; i < 15; i++) {
            this.bubblesList.push(new Bubble(this.canvas.parentNode as HTMLElement));
          }
        }
      }

      window.addEventListener('mousemove', (e) => {
        bubblesList.forEach(bubble => {
          bubble.mouseX = e.clientX;
          bubble.mouseY = e.clientY;
        });
      });

      const bubblesList: Bubble[] = [];
      const heroParticles = new Background(heroParticlesCanvas);
      heroParticles.start();
    }

    // Add animations class and load animations
    document.body.classList.add('has-animations');
    window.addEventListener('load', () => {
      document.body.classList.add('is-loaded');
    });

  }, []);

  return (
    <div className="body-wrap boxed-container">
      {/* Header - Exact Laurel Structure */}
      <header className="site-header">
        <div className="container">
          <div className="site-header-inner">
            <div className="brand header-brand">
              <h1 className="m-0">
                <a href="#" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
                  <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                    <title>UNI-TEL</title>
                    <defs>
                      <linearGradient x1="0%" y1="100%" x2="50%" y2="0%" id="logo-a">
                        <stop stopColor="#3B82F6" stopOpacity=".8" offset="0%"/>
                        <stop stopColor="#6366F1" stopOpacity=".16" offset="100%"/>
                      </linearGradient>
                      <linearGradient x1="50%" y1="100%" x2="50%" y2="0%" id="logo-b">
                        <stop stopColor="#FDFFDA" offset="0%"/>
                        <stop stopColor="#8B5CF6" stopOpacity=".798" offset="49.935%"/>
                        <stop stopColor="#3B82F6" stopOpacity="0" offset="100%"/>
                      </linearGradient>
                    </defs>
                    <g fill="none" fillRule="evenodd">
                      <path d="M22 19.22c6.627 0 9.593-6.415 9.593-13.042C31.593-.45 28.627.007 22 .007S10 2.683 10 9.31c0 6.628 5.373 9.91 12 9.91z" fill="url(#logo-a)"/>
                      <path d="M13.666 31.889c7.547 0 10.924-7.307 10.924-14.854 0-7.547-3.377-7.027-10.924-7.027C6.118 10.008 0 13.055 0 20.603c0 7.547 6.118 11.286 13.666 11.286z" fill="url(#logo-b)" transform="matrix(-1 0 0 1 24.59 0)"/>
                    </g>
                  </svg>
                  <span style={{ marginLeft: '8px', fontSize: '20px', fontWeight: 'bold', color: '#FFFFFF' }}>UNI-TEL</span>
                </a>
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section - Exact Laurel Structure */}
        <section className="hero">
          <div className="container">
            <div className="hero-inner">
              <div className="hero-copy">
                <h1 className="hero-title mt-0">Transform Your Academic Journey</h1>
                <p className="hero-paragraph">
                  The all-in-one platform for students to track grades, attendance, and academic goals. 
                  Get insights, stay organized, and achieve your academic potential.
                </p>
                <div className="hero-cta">
                  <a 
                    className="button button-shadow" 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); navigate('/auth'); }}
                  >
                    Learn more
                  </a>
                  <a 
                    className="button button-primary button-shadow" 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); navigate('/auth'); }}
                  >
                    Early access
                  </a>
                </div>
              </div>
              <div className="hero-app">
                <div className="hero-app-illustration">
                  <svg width="999" height="931" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient x1="92.827%" y1="0%" x2="53.422%" y2="80.087%" id="hero-shape-a">
                        <stop stopColor="#3B82F6" offset="0%"/>
                        <stop stopColor="#8B5CF6" stopOpacity="0" offset="100%"/>
                      </linearGradient>
                      <linearGradient x1="92.827%" y1="0%" x2="53.406%" y2="80.12%" id="hero-shape-b">
                        <stop stopColor="#6366F1" offset="0%"/>
                        <stop stopColor="#3B82F6" stopOpacity="0" offset="80.532%"/>
                        <stop stopColor="#FDFFDA" stopOpacity="0" offset="100%"/>
                      </linearGradient>
                      <linearGradient x1="8.685%" y1="23.733%" x2="85.808%" y2="82.837%" id="hero-shape-c">
                        <stop stopColor="#FFF" stopOpacity=".48" offset="0%"/>
                        <stop stopColor="#FFF" stopOpacity="0" offset="100%"/>
                      </linearGradient>
                      <linearGradient x1="79.483%" y1="15.903%" x2="38.42%" y2="70.124%" id="hero-shape-d">
                        <stop stopColor="#3B82F6" offset="0%"/>
                        <stop stopColor="#FDFFDA" stopOpacity="0" offset="100%"/>
                      </linearGradient>
                      <linearGradient x1="99.037%" y1="26.963%" x2="24.582%" y2="78.557%" id="hero-shape-e">
                        <stop stopColor="#FDFFDA" stopOpacity=".64" offset="0%"/>
                        <stop stopColor="#8B5CF6" stopOpacity=".24" offset="42.952%"/>
                        <stop stopColor="#3B82F6" stopOpacity="0" offset="100%"/>
                      </linearGradient>
                    </defs>
                    <g fill="none" fillRule="evenodd">
                      <g className="hero-shape-top">
                        <g className="is-moving-object is-translating" data-translating-factor="280">
                          <path d="M680.188 0c-23.36 69.79-58.473 98.3-105.34 85.531-70.301-19.152-189.723-21.734-252.399 91.442-62.676 113.175-144.097 167.832-215.195 118.57C59.855 262.702 24.104 287.85 0 370.988L306.184 566.41c207.164-4.242 305.67-51.612 295.52-142.11-10.152-90.497 34.533-163.55 134.054-219.16l4.512-119.609L680.188 0z" fill="url(#hero-shape-a)" transform="translate(1)"/>
                        </g>
                        <g className="is-moving-object is-translating" data-translating-factor="100">
                          <path d="M817.188 222c-23.36 69.79-58.473 98.3-105.34 85.531-70.301-19.152-189.723-21.734-252.399 91.442-62.676 113.175-144.097 167.832-215.195 118.57-47.399-32.841-83.15-7.693-107.254 75.445L443.184 788.41c207.164-4.242 305.67-51.612 295.52-142.11-10.152-90.497 34.533-163.55 134.054-219.16l4.512-119.609L817.188 222z" fill="url(#hero-shape-b)" transform="rotate(-53 507.635 504.202)"/>
                        </g>
                      </g>
                      <g transform="translate(191 416)">
                        <g className="is-moving-object is-translating" data-translating-factor="50">
                          <circle fill="url(#hero-shape-c)" cx="336" cy="190" r="190"/>
                        </g>
                        <g className="is-moving-object is-translating" data-translating-factor="80">
                          <path d="M683.766 133.043c-112.048-90.805-184.688-76.302-217.92 43.508-33.23 119.81-125.471 124.8-276.722 14.972-3.156 120.356 53.893 200.09 171.149 239.203 175.882 58.67 346.695-130.398 423.777-239.203 51.388-72.536 17.96-92.03-100.284-58.48z" fill="url(#hero-shape-d)"/>
                        </g>
                        <g className="is-moving-object is-translating" data-translating-factor="100">
                          <path d="M448.206 223.247c-97.52-122.943-154.274-117.426-170.26 16.55C261.958 373.775 169.717 378.766 1.222 254.77c-9.255 95.477 47.794 175.211 171.148 239.203 185.032 95.989 424.986-180.108 424.986-239.203 0-39.396-49.717-49.904-149.15-31.523z" fill="url(#hero-shape-e)" transform="matrix(-1 0 0 1 597.61 0)"/>
                        </g>
                      </g>
                    </g>
                  </svg>
                </div>
                <img 
                  className="device-mockup" 
                  src="/api/placeholder/350/600" 
                  alt="UNI-TEL App Preview"
                />
                <div className="hero-app-dots hero-app-dots-1">
                  <svg width="124" height="75" xmlns="http://www.w3.org/2000/svg">
                    <g fill="none" fillRule="evenodd">
                      <path fill="#FFF" d="M33.392 0l3.624 1.667.984 3.53-1.158 3.36L33.392 10l-3.249-1.639L28 5.196l1.62-3.674z"/>
                      <path fill="#7487A3" d="M74.696 3l1.812.833L77 5.598l-.579 1.68L74.696 8l-1.624-.82L72 5.599l.81-1.837z"/>
                      <path fill="#556B8B" d="M40.696 70l1.812.833.492 1.765-.579 1.68-1.725.722-1.624-.82L38 72.599l.81-1.837z"/>
                      <path fill="#7487A3" d="M4.314 37l2.899 1.334L8 41.157l-.926 2.688L4.314 45l-2.6-1.31L0 41.156l1.295-2.94zM49.314 32l2.899 1.334.787 2.823-.926 2.688L49.314 40l-2.6-1.31L45 36.156l1.295-2.94z"/>
                      <path fill="#556B8B" d="M99.696 56l1.812.833.492 1.765-.579 1.68-1.725.722-1.624-.82L97 58.599l.81-1.837zM112.696 37l1.812.833.492 1.765-.579 1.68-1.725.722-1.624-.82L110 39.599l.81-1.837zM82.696 37l1.812.833.492 1.765-.579 1.68-1.725.722-1.624-.82L80 39.599l.81-1.837zM122.618 57l1.087.5.295 1.059-.347 1.008-1.035.433-.975-.492-.643-.95.486-1.101z"/>
                    </g>
                  </svg>
                </div>
                <div className="hero-app-dots hero-app-dots-2">
                  <svg width="124" height="75" xmlns="http://www.w3.org/2000/svg">
                    <g fill="none" fillRule="evenodd">
                      <path fill="#556B8B" d="M33.392 0l3.624 1.667.984 3.53-1.158 3.36L33.392 10l-3.249-1.639L28 5.196l1.62-3.674zM74.696 3l1.812.833L77 5.598l-.579 1.68L74.696 8l-1.624-.82L72 5.599l.81-1.837zM40.696 70l1.812.833.492 1.765-.579 1.68-1.725.722-1.624-.82L38 72.599l.81-1.837zM4.314 37l2.899 1.334L8 41.157l-.926 2.688L4.314 45l-2.6-1.31L0 41.156l1.295-2.94zM49.314 32l2.899 1.334.787 2.823-.926 2.688L49.314 40l-2.6-1.31L45 36.156l1.295-2.94z"/>
                      <path fill="#FFF" d="M99.696 56l1.812.833.492 1.765-.579 1.68-1.725.722-1.624-.82L97 58.599l.81-1.837z"/>
                      <path fill="#556B8B" d="M112.696 37l1.812.833.492 1.765-.579 1.68-1.725.722-1.624-.82L110 39.599l.81-1.837z"/>
                      <path fill="#FFF" d="M82.696 37l1.812.833.492 1.765-.579 1.68-1.725.722-1.624-.82L80 39.599l.81-1.837z"/>
                      <path fill="#556B8B" d="M122.618 57l1.087.5.295 1.059-.347 1.008-1.035.433-.975-.492-.643-.95.486-1.101z"/>
                    </g>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - Exact Laurel Structure */}
        <section className="features section">
          <div className="container">
            <div className="features-inner section-inner has-bottom-divider">
              <h2 className="section-title mt-0">Bold features</h2>
              <div className="features-wrap">
                <div className="feature is-revealing">
                  <div className="feature-inner">
                    <div className="feature-icon">
                      <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <linearGradient x1="0%" y1="100%" x2="50%" y2="0%" id="feature-1-a">
                            <stop stopColor="#3B82F6" stopOpacity=".8" offset="0%"/>
                            <stop stopColor="#6366F1" stopOpacity=".16" offset="100%"/>
                          </linearGradient>
                          <linearGradient x1="50%" y1="100%" x2="50%" y2="0%" id="feature-1-b">
                            <stop stopColor="#FDFFDA" offset="0%"/>
                            <stop stopColor="#8B5CF6" stopOpacity=".798" offset="49.935%"/>
                            <stop stopColor="#3B82F6" stopOpacity="0" offset="100%"/>
                          </linearGradient>
                        </defs>
                        <g fill="none" fillRule="evenodd">
                          <path d="M24 48H0V24C0 10.745 10.745 0 24 0h24v24c0 13.255-10.745 24-24 24" fill="url(#feature-1-a)"/>
                          <path d="M40 64H16V40c0-13.255 10.745-24 24-24h24v24c0 13.255-10.745 24-24 24" fill="url(#feature-1-b)"/>
                        </g>
                      </svg>
                    </div>
                    <h3 className="feature-title mt-24">Academic Tracking</h3>
                    <p className="text-sm mb-0">Track your grades, attendance, and academic progress in real-time with comprehensive analytics.</p>
                  </div>
                </div>
                <div className="feature is-revealing">
                  <div className="feature-inner">
                    <div className="feature-icon">
                      <svg width="68" height="64" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <linearGradient x1="0%" y1="100%" x2="50%" y2="0%" id="feature-2-a">
                            <stop stopColor="#3B82F6" stopOpacity=".8" offset="0%"/>
                            <stop stopColor="#6366F1" stopOpacity=".16" offset="100%"/>
                          </linearGradient>
                          <linearGradient x1="50%" y1="100%" x2="50%" y2="0%" id="feature-2-b">
                            <stop stopColor="#FDFFDA" offset="0%"/>
                            <stop stopColor="#8B5CF6" stopOpacity=".798" offset="49.935%"/>
                            <stop stopColor="#3B82F6" stopOpacity="0" offset="100%"/>
                          </linearGradient>
                        </defs>
                        <g fill="none" fillRule="evenodd">
                          <path d="M9.941 63.941v-24c0-13.255 10.745-24 24-24h24v24c0 13.255-10.745 24-24 24h-24z" fill="url(#feature-2-a)" transform="rotate(45 33.941 39.941)"/>
                          <path d="M16 0v24c0 13.255 10.745 24 24 24h24V24C64 10.745 53.255 0 40 0H16z" fill="url(#feature-2-b)"/>
                        </g>
                      </svg>
                    </div>
                    <h3 className="feature-title mt-24">Analytics Dashboard</h3>
                    <p className="text-sm mb-0">Get insights into your performance with detailed analytics and progress tracking.</p>
                  </div>
                </div>
                <div className="feature is-revealing">
                  <div className="feature-inner">
                    <div className="feature-icon">
                      <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <linearGradient x1="50%" y1="100%" x2="50%" y2="43.901%" id="feature-3-a">
                            <stop stopColor="#8B5CF6" stopOpacity=".798" offset="0%"/>
                            <stop stopColor="#3B82F6" stopOpacity="0" offset="100%"/>
                          </linearGradient>
                          <linearGradient x1="58.893%" y1="100%" x2="58.893%" y2="18.531%" id="feature-3-b">
                            <stop stopColor="#3B82F6" stopOpacity=".8" offset="0%"/>
                            <stop stopColor="#6366F1" stopOpacity="0" offset="100%"/>
                          </linearGradient>
                          <linearGradient x1="50%" y1="100%" x2="50%" y2="0%" id="feature-3-c">
                            <stop stopColor="#FDFFDA" offset="0%"/>
                            <stop stopColor="#8B5CF6" stopOpacity=".798" offset="49.935%"/>
                            <stop stopColor="#3B82F6" stopOpacity="0" offset="100%"/>
                          </linearGradient>
                        </defs>
                        <g fill="none" fillRule="evenodd">
                          <path fill="url(#feature-3-a)" opacity=".32" d="M0 24h64v40H0z"/>
                          <path fill="url(#feature-3-b)" d="M40 24H24L0 64h64z"/>
                          <path d="M10 10v22c0 12.15 9.85 22 22 22h22V32c0-12.15-9.85-22-22-22H10z" fill="url(#feature-3-c)" transform="rotate(45 32 32)"/>
                        </g>
                      </svg>
                    </div>
                    <h3 className="feature-title mt-24">Goal Setting</h3>
                    <p className="text-sm mb-0">Set and track academic goals to stay motivated and achieve your targets.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Venus Hero Section */}
        <section className="hero text-center text-light">
          <div className="hero-bg"></div>
          <div className="hero-particles-container">
            <canvas id="hero-particles"></canvas>
          </div>
          <div className="container-sm">
            <div className="hero-inner">
              <div className="hero-copy">
                <h1 className="hero-title mt-0">Meet UNI-TEL</h1>
                <p className="hero-paragraph">
                  The comprehensive platform for students to track, analyze, and improve their academic performance. 
                  Join thousands of students achieving their goals.
                </p>
                <div className="hero-cta">
                  <a 
                    className="button button-primary button-wide-mobile" 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); navigate('/auth'); }}
                  >
                    Get early access
                  </a>
                </div>
              </div>
              <div className="mockup-container">
                <div className="mockup-bg">
                  <img src="/api/placeholder/400/300" alt="UNI-TEL illustration" />
                </div>
                <img className="device-mockup" src="/api/placeholder/300/600" alt="UNI-TEL Hero" />
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Section - Exact Laurel Structure */}
        <section className="newsletter section">
          <div className="container-sm">
            <div className="newsletter-inner section-inner">
              <div className="newsletter-header text-center">
                <h2 className="section-title mt-0">Stay in the know</h2>
                <p className="section-paragraph">Subscribe to our newsletter for tips, updates, and academic success stories.</p>
              </div>
              <div className="footer-form newsletter-form field field-grouped">
                <div className="control control-expanded">
                  <input className="input" type="email" name="email" placeholder="Your best email…" />
                </div>
                <div className="control">
                  <a 
                    className="button button-primary button-block button-shadow" 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); navigate('/auth'); }}
                  >
                    Early access
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer - Exact Laurel Structure */}
      <footer className="site-footer">
        <div className="container">
          <div className="site-footer-inner has-top-divider">
            <div className="brand footer-brand">
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
                <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                  <title>UNI-TEL</title>
                  <defs>
                    <linearGradient x1="0%" y1="100%" x2="50%" y2="0%" id="logo-footer-a">
                      <stop stopColor="#3B82F6" stopOpacity=".8" offset="0%"/>
                      <stop stopColor="#6366F1" stopOpacity=".16" offset="100%"/>
                    </linearGradient>
                    <linearGradient x1="50%" y1="100%" x2="50%" y2="0%" id="logo-footer-b">
                      <stop stopColor="#FDFFDA" offset="0%"/>
                      <stop stopColor="#8B5CF6" stopOpacity=".798" offset="49.935%"/>
                      <stop stopColor="#3B82F6" stopOpacity="0" offset="100%"/>
                    </linearGradient>
                  </defs>
                  <g fill="none" fillRule="evenodd">
                    <path d="M22 19.22c6.627 0 9.593-6.415 9.593-13.042C31.593-.45 28.627.007 22 .007S10 2.683 10 9.31c0 6.628 5.373 9.91 12 9.91z" fill="url(#logo-footer-a)"/>
                    <path d="M13.666 31.889c7.547 0 10.924-7.307 10.924-14.854 0-7.547-3.377-7.027-10.924-7.027C6.118 10.008 0 13.055 0 20.603c0 7.547 6.118 11.286 13.666 11.286z" fill="url(#logo-footer-b)" transform="matrix(-1 0 0 1 24.59 0)"/>
                  </g>
                </svg>
                <span style={{ marginLeft: '8px', fontSize: '20px', fontWeight: 'bold', color: '#FFFFFF' }}>UNI-TEL</span>
              </a>
            </div>
            <ul className="footer-links list-reset">
              <li><a href="#">Contact</a></li>
              <li><a href="#">About us</a></li>
              <li><a href="#">FAQ's</a></li>
              <li><a href="#">Support</a></li>
            </ul>
            <ul className="footer-social-links list-reset">
              <li>
                <a href="#">
                  <span className="screen-reader-text">Facebook</span>
                  <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6.023 16L6 9H3V6h3V4c0-2.7 1.672-4 4.08-4 1.153 0 2.144.086 2.433.124v2.821h-1.67c-1.31 0-1.563.623-1.563 1.536V6H13l-1 3H9.28v7H6.023z" fill="#FFF"/>
                  </svg>
                </a>
              </li>
              <li>
                <a href="#">
                  <span className="screen-reader-text">Twitter</span>
                  <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 3c-.6.3-1.2.4-1.9.5.7-.4 1.2-1 1.4-1.8-.6.4-1.3.6-2.1.8-.6-.6-1.5-1-2.4-1-1.7 0-3.2 1.5-3.2 3.3 0 .3 0 .5.1.7-2.7-.1-5.2-1.4-6.8-3.4-.3.5-.4 1-.4 1.7 0 1.1.6 2.1 1.5 2.7-.5 0-1-.2-1.5-.4C.7 7.7 1.8 9 3.3 9.3c-.3.1-.6.1-.9.1-.2 0-.4 0-.6-.1.4 1.3 1.6 2.3 3.1 2.3-1.1.9-2.5 1.4-4.1 1.4H0c1.5.9 3.2 1.5 5 1.5 6 0 9.3-5 9.3-9.3v-.4C15 4.3 15.6 3.7 16 3z" fill="#FFF"/>
                  </svg>
                </a>
              </li>
              <li>
                <a href="#">
                  <span className="screen-reader-text">Google</span>
                  <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.9 7v2.4H12c-.2 1-1.2 3-4 3-2.4 0-4.3-2-4.3-4.4 0-2.4 2-4.4 4.3-4.4 1.4 0 2.3.6 2.8 1.1l1.9-1.8C11.5 1.7 9.9 1 8 1 4.1 1 1 4.1 1 8s3.1 7 7 7c4 0 6.7-2.8 6.7-6.8 0-.5 0-.8-.1-1.2H7.9z" fill="#FFF"/>
                  </svg>
                </a>
              </li>
            </ul>
            <div className="footer-copyright">&copy; 2024 UNI-TEL, all rights reserved</div>
          </div>
        </div>
      </footer>
    </div>
  );
}