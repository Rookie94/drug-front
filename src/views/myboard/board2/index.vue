
<template>
    <div class="iframe-container">
      <div 
        class="overlay" 
        @dblclick="handleDoubleClick"
        :style="{display: isDragging ? 'block' : 'none'}"
      ></div>
      <iframe 
        ref="myIframe" 
        src="/static/board/board2/index.html" 
        width="100%" 
        height="1200" 
        @load="initOverlay"
        frameborder="0">
      </iframe>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        winfull: { full: false },
        isDragging: false
      }
    },
    mounted() {
      window.addEventListener('fullscreenchange', this.handleFullScreenChange);
      window.addEventListener('webkitfullscreenchange', this.handleFullScreenChange);
      window.addEventListener('mozfullscreenchange', this.handleFullScreenChange);
      window.addEventListener('msfullscreenchange', this.handleFullScreenChange);
    },
    beforeUnmount() {
      window.removeEventListener('fullscreenchange', this.handleFullScreenChange);
      window.removeEventListener('webkitfullscreenchange', this.handleFullScreenChange);
      window.removeEventListener('mozfullscreenchange', this.handleFullScreenChange);
      window.removeEventListener('msfullscreenchange', this.handleFullScreenChange);
    },
    methods: {
      handleFullScreenChange() {
        const elem = document.querySelector('.app-container');
        if (document.fullscreenElement === elem) {
          document.body.classList.add('fullscreen-mode');
        } else {
          document.body.classList.remove('fullscreen-mode');
        }
      },
      fullscreen() {
        this.winfull.full = !this.winfull.full;
        if (this.winfull.full) {
          this.$store.dispatch('app/toggleSideBarHide', true);
          this.$store.dispatch('settings/setNavbar_tags', false);
        } else {
          this.$store.dispatch('app/toggleSideBarHide', false);
          this.$store.dispatch('settings/setNavbar_tags', true);
        }
        const elem = document.querySelector('.app-container');
        if (!document.fullscreenElement) {
          elem.requestFullscreen?.() || 
          elem.webkitRequestFullscreen?.() || 
          elem.mozRequestFullScreen?.() || 
          elem.msRequestFullscreen?.();
        } else {
          document.exitFullscreen?.() || 
          document.webkitExitFullscreen?.() || 
          document.mozCancelFullScreen?.() || 
          document.msExitFullscreen?.();
        }
      },
      initOverlay() {
        const iframe = this.$refs.myIframe;
        const overlay = this.$el.querySelector('.overlay');
        if (iframe && overlay) {
          overlay.style.width = `${iframe.offsetWidth}px`;
          overlay.style.height = `${iframe.offsetHeight}px`;
          this.isDragging = true;
        }
      },
      handleDoubleClick() {
        this.fullscreen();
      }
    }
  }
  </script>
  
  <style scoped>
  .iframe-container {
    position: relative;
  }
  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
    background: transparent;
    cursor: pointer;
  }
  </style>
  