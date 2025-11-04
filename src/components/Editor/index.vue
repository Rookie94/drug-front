<template>
  <div>
    <el-upload
      :action="uploadUrl"
      :accept="'image/*,audio/*,video/*'"
      :before-upload="handleBeforeUpload"
      :on-success="handleUploadSuccess"
      :on-error="handleUploadError"
      name="file"
      :show-file-list="false"
      :headers="headers"
      style="display: none"
      ref="upload"
      v-if="this.type == 'url'"
    >
    </el-upload>
    <div class="editor" ref="editor" :style="styles"></div>
  </div>  
</template>

<script>
import Quill from "quill";
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import "quill/dist/quill.bubble.css";

import { ImageDrop } from 'quill-image-drop-module'
Quill.register('modules/imageDrop', ImageDrop)

import imageResize from 'quill-image-resize-module--fix-imports-error'; 
Quill.register('modules/imageResize', imageResize);

import Audio from "./audio";
import Video from "./video";
import { getToken } from "@/utils/auth";

Quill.register(Audio, true);
Quill.register(Video, true);

// 自定义字体
let fontFamily = ['SimSun', 'SimHei', 'Microsoft-YaHei', 'KaiTi', 'FangSong', 'Arial', 'pingfang'];
Quill.imports['formats/font'].whitelist = fontFamily;
Quill.register(Quill.imports['formats/font'])
 
// 自定义文字大小
let fontSize = ['10px', '12px', '14px', '16px', '20px', '24px', '36px']
Quill.imports['attributors/style/size'].whitelist = fontSize;
Quill.register(Quill.imports['attributors/style/size']);
 
export default {
  name: "Editor",
  props: {
    /* 编辑器的内容 */
    value: {
      type: String,
      default: "",
    },
    /* 高度 */
    height: {
      type: Number,
      default: null,
    },
    /* 最小高度 */
    minHeight: {
      type: Number,
      default: null,
    },
    /* 只读 */
    readOnly: {
      type: Boolean,
      default: false,
    },
    // 上传文件大小限制(MB)
    fileSize: {
      type: Number,
      default: 10,
    },
    // 上传文件大小限制(MB)
    audioFileSize: {
      type: Number,
      default: 50,
    },   
    // 上传文件大小限制(MB)
    videoFileSize: {
      type: Number,
      default: 200,
    },      
    /* 类型（base64格式、url格式） */
    type: {
      type: String,
      default: "url",
    }
  },
  data() {
    return {
      uploadUrl: process.env.VUE_APP_BASE_API + "/common/upload", // 上传的图片服务器地址
      headers: {
        Authorization: "Bearer " + getToken()
      },
      Quill: null,
      currentValue: "",
      uploadType: "",      
      options: {
        theme: "snow",
        bounds: document.body,
        debug: "warn",
        modules: {
          // 工具栏配置
          toolbar: [
            ["bold", "italic", "underline", "strike"],       // 加粗 斜体 下划线 删除线
            ["blockquote", "code-block"],                    // 引用  代码块
            [{ list: "ordered" }, { list: "bullet" }],       // 有序、无序列表
            [{'script': 'sub'}, {'script': 'super'}],        // 上下标
            [{'direction': 'rtl'}],                          // 文本方向
            [{ indent: "-1" }, { indent: "+1" }],            // 缩进
            [{ font: fontFamily }],                          // 字体      
            [{ size: fontSize }],                            // 文字大小
            [{ header: [1, 2, 3, 4, 5, 6, false] }],         // 标题
            [{ color: [] }, { background: [] }],             // 字体颜色、字体背景颜色            
            [{ align: [] }],                                 // 对齐方式
            ["clean"],                                       // 清除文本格式
            ["link", "image", "audio", "video"],              // 链接、图片、视频
          ],
          imageResize: { displayStyles: { backgroundColor: 'black', border: 'none', color: 'white' }, modules: [ 'Resize', 'DisplaySize', 'Toolbar' ] }
        },
        placeholder: "请输入内容",
        readOnly: this.readOnly,
      },
    };
  },
  computed: {
    styles() {
      let style = {};
      if (this.minHeight) {
        style.minHeight = `${this.minHeight}px`;
      }
      if (this.height) {
        style.height = `${this.height}px`;
      }
      return style;
    },
  },
  watch: {
    value: {
      handler(val) {
        if (val !== this.currentValue) {
          this.currentValue = val === null ? "" : val;
          if (this.Quill) {
            this.Quill.clipboard.dangerouslyPasteHTML(this.currentValue);
          }
        }
      },
      immediate: true,
    },
  },
  mounted() {
    this.init();
  },
  beforeDestroy() {
    this.Quill = null;
  },
  methods: {
    init() {
      const editor = this.$refs.editor;
      this.Quill = new Quill(editor, this.options);
      //如果设置了上传地址则自定义图片上传事件
      if (this.type == 'url') {
        let toolbar = this.Quill.getModule("toolbar");
        toolbar.addHandler("image", (value) => {
          this.uploadType = "image";
          if (value) {
            this.$refs.upload.$children[0].$refs.input.click();
          } else {
            this.quill.format("image", false);
          }
        });
        toolbar.addHandler("audio", (value) => {
          this.uploadType = "audio";
          if (value) {
            this.$refs.upload.$children[0].$refs.input.click();
          } else {
            this.quill.format("audio", false);
          }
        });
        toolbar.addHandler("video", (value) => {
          this.uploadType = "video";
          if (value) {
            this.$refs.upload.$children[0].$refs.input.click();
          } else {
            this.quill.format("video", false);
          }
        });
      }
      this.Quill.clipboard.dangerouslyPasteHTML(this.currentValue);
      this.Quill.on("text-change", (delta, oldDelta, source) => {
        const html = this.$refs.editor.children[0].innerHTML;
        const text = this.Quill.getText();
        const quill = this.Quill;
        this.currentValue = html;
        this.$emit("input", html);
        this.$emit("on-change", { html, text, quill });
      });
      this.Quill.on("text-change", (delta, oldDelta, source) => {
        this.$emit("on-text-change", delta, oldDelta, source);
      });
      this.Quill.on("selection-change", (range, oldRange, source) => {
        this.$emit("on-selection-change", range, oldRange, source);
      });
      this.Quill.on("editor-change", (eventName, ...args) => {
        this.$emit("on-editor-change", eventName, ...args);
      });
    },
    // 上传前校检格式和大小
    handleBeforeUpload(file) {
      // 校检文件大小
      if (this.uploadType=="image"){
          const type = ["image/jpeg", "image/jpg", "image/png", "image/gif","image/bmp", "image/svg"];
          const isJPG = type.includes(file.type.toLowerCase());
          // 检验文件格式
          if (!isJPG) {
            this.$message.error(`图片格式错误!`);
            return false;
          }
          if (this.fileSize) {
          const isLt = file.size / 1024 / 1024 < this.fileSize;
          if (!isLt) {
            this.$message.error(`上传图片大小不能超过 ${this.fileSize} MB!`);
            return false;
          }
        }
      }
      else if(this.uploadType=="audio"){
          const type = ["audio/mp3", "audio/wma", "audio/wav", "audio/ape","audio/flac", "audio/ogg","audio/mpeg"];
          const isJPG = type.includes(file.type.toLowerCase());
          // 检验文件格式
          if (!isJPG) {
            this.$message.error(`音频格式错误!`);
            return false;
          }        
          if (this.audioFileSize) {
          const isLt = file.size / 1024 / 1024 < this.fileSize;
          if (!isLt) {
            this.$message.error(`上传音频大小不能超过 ${this.audioFileSize} MB!`);
            return false;
          }
        }
      }
      else if(this.uploadType=="video"){
          const type = ["video/mp4", "video/wmv", "video/avi", "video/mpg", "video/rm", "video/rmvb","video/mpeg", "video/ogg", "video/webm"];
          const isJPG = type.includes(file.type.toLowerCase());
          // 检验文件格式
          if (!isJPG) {
            this.$message.error(`视频格式错误!`);
            return false;
          }          
          if (this.videoFileSize) {
          const isLt = file.size / 1024 / 1024 < this.videoFileSize;
          if (!isLt) {
            this.$message.error(`上传视频大小不能超过 ${this.fileSize} MB!`);
            return false;
          }
        }
      }     
      this.loading = this.$loading({
                lock: true,
                text: '上传中',
                background: 'rgba(0, 0, 0, 0.7)'
      });
      return true;
    },
    handleUploadSuccess(res, file) {
      this.loading.close();
      // 如果上传成功
      if (res.code == 200) {
        // 获取富文本组件实例
        let quill = this.Quill;
        // 获取光标所在位置
        let length = quill.getSelection().index;
         // 检查返回的图片 URL 是否以 http 开头
        // 插入图片  res.url为服务器返回的图片地址
        if(this.uploadType=="image"){
          quill.insertEmbed(length, "image",res.fileName);
        }
        else if(this.uploadType=="audio"){
          quill.insertEmbed(length, "audio",res.fileName);
        }
        else if(this.uploadType=="video"){
          quill.insertEmbed(length, "video",res.fileName);
        }  
        // 调整光标到最后
        quill.setSelection(length + 1);
      } else {
        this.$message.error("图片插入失败");
      }
    },
    handleUploadError() {
      this.loading.close();
      this.$message.error("资源插入失败");
    },
  },
};
</script>

<style>
.editor, .ql-toolbar {
  white-space: pre-wrap !important;
  line-height: normal !important;
}
.quill-img {
  display: none;
}
.ql-snow button.ql-audio {
  background-image: url("./audio.svg");
  background-repeat: no-repeat;
  background-position: center;
}

.ql-snow .ql-tooltip[data-mode="link"]::before {
  content: "请输入链接地址:";
}
.ql-snow .ql-tooltip.ql-editing a.ql-action::after {
  border-right: 0px;
  content: "保存";
  padding-right: 0px;
}

.ql-snow .ql-tooltip[data-mode="video"]::before {
  content: "请输入视频地址:";
}

.ql-snow .ql-picker.ql-size .ql-picker-label::before,
.ql-snow .ql-picker.ql-size .ql-picker-item::before {
  content: "14px";
}
.ql-snow .ql-picker.ql-size .ql-picker-label[data-value="small"]::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="small"]::before {
  content: "10px";
}
.ql-snow .ql-picker.ql-size .ql-picker-label[data-value="large"]::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="large"]::before {
  content: "18px";
}
.ql-snow .ql-picker.ql-size .ql-picker-label[data-value="huge"]::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="huge"]::before {
  content: "32px";
}

.ql-snow .ql-picker.ql-header .ql-picker-label::before,
.ql-snow .ql-picker.ql-header .ql-picker-item::before {
  content: "文本";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="1"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="1"]::before {
  content: "标题1";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="2"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="2"]::before {
  content: "标题2";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="3"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="3"]::before {
  content: "标题3";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="4"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="4"]::before {
  content: "标题4";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="5"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="5"]::before {
  content: "标题5";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="6"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="6"]::before {
  content: "标题6";
}

.ql-snow .ql-picker.ql-font .ql-picker-label::before,
.ql-snow .ql-picker.ql-font .ql-picker-item::before {
  content: "标准字体";
}
.ql-snow .ql-picker.ql-font .ql-picker-label[data-value="serif"]::before,
.ql-snow .ql-picker.ql-font .ql-picker-item[data-value="serif"]::before {
  content: "衬线字体";
}
.ql-snow .ql-picker.ql-font .ql-picker-label[data-value="monospace"]::before,
.ql-snow .ql-picker.ql-font .ql-picker-item[data-value="monospace"]::before {
  content: "等宽字体";
}

/*
    文字大小
  */
  .ql-snow .ql-picker.ql-size .ql-picker-label[data-value='10px']::before,
  .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='10px']::before {
    content: '10px';
  }
  .ql-snow .ql-picker.ql-size .ql-picker-label[data-value='12px']::before,
  .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='12px']::before {
    content: '12px';
  }
  .ql-snow .ql-picker.ql-size .ql-picker-label[data-value='14px']::before,
  .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='14px']::before {
    content: '14px';
  }
  .ql-snow .ql-picker.ql-size .ql-picker-label[data-value='16px']::before,
  .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='16px']::before {
    content: '16px';
  }
  .ql-snow .ql-picker.ql-size .ql-picker-label[data-value='20px']::before,
  .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='20px']::before {
    content: '20px';
  }
  .ql-snow .ql-picker.ql-size .ql-picker-label[data-value='24px']::before,
  .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='24px']::before {
    content: '24px';
  }
  .ql-snow .ql-picker.ql-size .ql-picker-label[data-value='36px']::before,
  .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='36px']::before {
    content: '36px';
  }

  /*
    字体
  */
  .ql-snow .ql-picker.ql-font .ql-picker-label[data-value='SimSun']::before,
  .ql-snow .ql-picker.ql-font .ql-picker-item[data-value='SimSun']::before {
    content: '宋体';
    font-family: 'SimSun' !important;
  }
  .ql-snow .ql-picker.ql-font .ql-picker-label[data-value='SimHei']::before,
  .ql-snow .ql-picker.ql-font .ql-picker-item[data-value='SimHei']::before {
    content: '黑体';
    font-family: 'SimHei';
  }
  .ql-snow .ql-picker.ql-font .ql-picker-label[data-value='Microsoft-YaHei']::before,
  .ql-snow .ql-picker.ql-font .ql-picker-item[data-value='Microsoft-YaHei']::before {
    content: '微软雅黑';
    font-family: '微软雅黑';
  }
  .ql-snow .ql-picker.ql-font .ql-picker-label[data-value='KaiTi']::before,
  .ql-snow .ql-picker.ql-font .ql-picker-item[data-value='KaiTi']::before {
    content: '楷体';
    font-family: 'KaiTi' !important;
  }
  .ql-snow .ql-picker.ql-font .ql-picker-label[data-value='FangSong']::before,
  .ql-snow .ql-picker.ql-font .ql-picker-item[data-value='FangSong']::before {
    content: '仿宋';
    font-family: 'FangSong';
  }
  .ql-snow .ql-picker.ql-font .ql-picker-label[data-value='Arial']::before,
  .ql-snow .ql-picker.ql-font .ql-picker-item[data-value='Arial']::before {
    content: 'Arial';
    font-family: 'Arial';
  }
  .ql-snow .ql-picker.ql-font .ql-picker-label[data-value='pingfang']::before,
  .ql-snow .ql-picker.ql-font .ql-picker-item[data-value='pingfang']::before {
    content: '苹方';
    font-family: '苹方';
  }

  .ql-font-SimSun {
    font-family: 'SimSun';
  }
  .ql-font-SimHei {
    font-family: 'SimHei';
  }
  .ql-font-Microsoft-YaHei {
    font-family: '微软雅黑';
  }
  .ql-font-KaiTi {
    font-family: 'KaiTi';
  }
  .ql-font-FangSong {
    font-family: 'FangSong';
  }
  .ql-font-Arial {
    font-family: 'Arial';
  }
  .ql-font-pingfang {
    font-family: '苹方';
  }

  .ql-indent-1 {
        padding-left: 0px !important;
        text-indent: 2ch !important;
    }

    .ql-indent-2 {
        padding-left: 0px !important;
        text-indent: 4ch !important;
    }

    .ql-indent-3 {
        padding-left: 0px !important;
        text-indent: 6ch !important;
    }

    .ql-indent-4 {
        padding-left: 0px !important;
        text-indent: 8ch !important;
    }

    .ql-indent-5 {
        padding-left: 0px !important;
        text-indent: 10ch !important;
    }

    .ql-indent-6 {
        padding-left: 0px !important;
        text-indent: 12ch !important;
    }

    .ql-indent-7 {
        padding-left: 0px !important;
        text-indent: 14ch !important;
    }

    .ql-indent-8 {
        padding-left: 0px !important;
        text-indent: 16ch !important;
    }

</style>
