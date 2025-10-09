import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Splash = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const thunderOverlay = document.querySelector('.thunder-overlay')
    const triggerThunder = () => {
      if (!thunderOverlay) return
      thunderOverlay.classList.remove('thunder-flash')
      void thunderOverlay.offsetWidth
      thunderOverlay.classList.add('thunder-flash')
    }

    const initial = setTimeout(triggerThunder, 500)
    const interval = setInterval(() => {
      if (Math.random() > 0.7) triggerThunder()
    }, 2000)

    const redirect = setTimeout(() => {
      navigate('/dashboard', { replace: true })
    }, 5000)

    return () => {
      clearTimeout(initial)
      clearInterval(interval)
      clearTimeout(redirect)
    }
  }, [navigate])

  return (
    <div className="splash-root">
      <style>{`
        *{margin:0;padding:0;box-sizing:border-box}
        .splash-root{font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;background:linear-gradient(135deg,#1a2a6c,#2a3a7c);height:100vh;display:flex;justify-content:center;align-items:center;overflow:hidden}
        .splash-container{position:relative;width:100%;height:100%;display:flex;flex-direction:column;justify-content:center;align-items:center}
        .thunder-overlay{position:absolute;top:0;left:0;width:100%;height:100%;background:radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%);opacity:0;z-index:1;pointer-events:none}
        .logo-container{position:relative;z-index:2;text-align:center;transform:scale(.8);animation:stampIn 1.2s cubic-bezier(.34,1.56,.64,1) forwards}
        .logo{font-size:5rem;font-weight:900;color:#ffffff;text-shadow:0 0 20px rgba(255,255,255,.7);margin-bottom:1rem;position:relative;display:inline-block}
        .logo:after{content:'';position:absolute;top:-5px;left:-5px;right:-5px;bottom:-5px;background:linear-gradient(45deg,#00c6ff,#0072ff,#00c6ff);z-index:-1;border-radius:10px;opacity:.7;filter:blur(15px);animation:thunderGlow 3s infinite alternate}
        .tagline{font-size:1.5rem;color:#e0e0ff;margin-bottom:2rem;opacity:0;animation:fadeIn 1s ease 1.2s forwards;text-shadow:0 0 10px rgba(255,255,255,.5)}
        .loading-bar{width:300px;height:6px;background:rgba(255,255,255,.2);border-radius:3px;overflow:hidden;position:relative;opacity:0;animation:fadeIn .5s ease 1.5s forwards}
        .loading-progress{position:absolute;height:100%;width:0;background:linear-gradient(90deg,#00c6ff,#0072ff);border-radius:3px;animation:loading 3s ease 1.8s forwards;box-shadow:0 0 10px rgba(0,198,255,.7)}
        @keyframes thunderGlow{0%,100%{opacity:.3;filter:blur(15px)}25%{opacity:.7;filter:blur(20px)}50%{opacity:.4;filter:blur(18px)}75%{opacity:.8;filter:blur(22px)}}
        @keyframes stampIn{0%{transform:scale(3);opacity:0}50%{transform:scale(.9);opacity:1}70%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes loading{0%{width:0%}100%{width:100%}}
        @keyframes thunderFlash{0%,100%{opacity:0}10%,30%,50%,70%,90%{opacity:.1}20%,40%,60%,80%{opacity:.3}}
        .thunder-flash{animation:thunderFlash .8s ease .5s}
        .flicker{animation:flicker 4s infinite alternate}
        @keyframes flicker{0%,18%,22%,25%,53%,57%,100%{text-shadow:0 0 20px rgba(255,255,255,.7)}20%,24%,55%{text-shadow:0 0 10px rgba(255,255,255,.5),0 0 30px rgba(0,198,255,.8)}}
        .circuit-line{position:absolute;width:100%;height:100%;top:0;left:0;z-index:0;opacity:.1}
        .circuit-line:before,.circuit-line:after{content:'';position:absolute;width:2px;height:100%;background:linear-gradient(to bottom,transparent,#00c6ff,transparent);animation:circuitFlow 8s linear infinite}
        .circuit-line:before{left:20%}
        .circuit-line:after{right:20%;animation-delay:-4s}
        @keyframes circuitFlow{0%{top:-100%}100%{top:100%}}
        @media (max-width:768px){.logo{font-size:3.5rem}.tagline{font-size:1.2rem}.loading-bar{width:250px}}
      `}</style>
      <div className="splash-container">
        <div className="thunder-overlay thunder-flash"></div>
        <div className="circuit-line"></div>
        <div className="logo-container">
          <div className="logo flicker">EDUBot</div>
          <div className="tagline">AI Powered Virtual Platform</div>
          <div className="loading-bar">
            <div className="loading-progress"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Splash

