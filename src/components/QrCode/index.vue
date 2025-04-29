<template>
  <div 
    class="qr-container" 
    ref="qrContainer"
    @click="handleDownload"
    :style="{ width: size + 'px', height: size + 'px' }"
  ></div>
</template>

<script>
import QRCode from 'qrcode-generator'

export default {
  props: {
    content: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      default: 50
    },
    fileName: {  // 新增文件名参数
      type: String,
      default: '活动参数二维码'
    }
  },
  mounted() {
    this.generateQR()
  },
  methods: {
    generateQR() {
      const qr = QRCode(0, 'L')
      qr.addData(this.content)
      qr.make()
       // 动态计算单元格尺寸
      const moduleCount = qr.getModuleCount()
      const cellSize = Math.max(1, Math.floor(this.size / moduleCount))
      this.$refs.qrContainer.innerHTML = qr.createImgTag(cellSize, 0)
    },
    
    handleDownload() {
      // 获取生成的图片元素
      const imgElement = this.$refs.qrContainer.getElementsByTagName('img')[0]
      
      if (imgElement) {
        // 创建临时下载链接
        const link = document.createElement('a')
        link.download = `${this.fileName}_${Date.now()}.png`
        link.href = imgElement.src
        link.style.display = 'none'
        
        // 触发下载
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    }
  }
}
</script>

<style scoped>
.qr-container {
  cursor: pointer;
  transition: transform 0.2s;
}

.qr-container:hover {
  transform: scale(1.05);
}

.qr-container img {
  width: 100%;
  height: auto;
  pointer-events: none; /* 防止点击图片空白区域失效 */
}
</style>
