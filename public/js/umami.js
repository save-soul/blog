(function() {
  function initUmami() {
    const script = document.createElement('script');
    script.defer = true;
    script.src = 'https://cloud.umami.is/script.js';
    script.setAttribute('data-website-id', 'e0731142-1356-46da-bd26-dcf10e752ba7');
    document.head.appendChild(script);
  }

  function handleRouteChange() {
    // 移除旧的Umami脚本
    const oldScript = document.querySelector('script[src="https://cloud.umami.is/script.js"]');
    if (oldScript) {
      oldScript.remove();
    }
    // 重新初始化Umami
    initUmami();
  }

  // 初始化Umami
  initUmami();

  // 监听路由变化事件
  document.addEventListener('astro:page-load', handleRouteChange);
})();