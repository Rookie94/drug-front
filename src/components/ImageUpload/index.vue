<template>
  <div class="component-upload-image">
    <el-upload
      multiple
      :action="uploadImgUrl"
      list-type="picture-card"
      :on-success="handleUploadSuccess"
      :before-upload="handleBeforeUpload"
      :limit="limit"
      :on-error="handleUploadError"
      :on-exceed="handleExceed"
      ref="imageUpload"
      :on-remove="handleDelete"
      :show-file-list="true"
      :headers="headers"
      :file-list="processedFileList"
      :on-preview="handlePictureCardPreview"
      :class="{hide: this.fileList.length >= this.limit}"
    >
      <i class="el-icon-plus"></i>
    </el-upload>
    
    <!-- 上传提示 -->
    <div class="el-upload__tip" slot="tip" v-if="showTip">
      请上传
      <template v-if="fileSize"> 大小不超过 <b style="color: #f56c6c">{{ fileSize }}MB</b> </template>
      <template v-if="fileType"> 格式为 <b style="color: #f56c6c">{{ fileType.join("/") }}</b> </template>
      的文件
    </div>

    <el-dialog
      :visible.sync="dialogVisible"
      title="预览"
      width="800"
      append-to-body
    >
      <img
        :src="dialogImageUrl"
        style="display: block; max-width: 100%; margin: 0 auto"
      />
    </el-dialog>
  </div>
</template>

<script>
import { getToken } from "@/utils/auth";

export default {
  props: {
    value: [String, Object, Array],
    // 图片数量限制
    limit: {
      type: Number,
      default: 50,
    },
    // 大小限制(MB)
    fileSize: {
       type: Number,
      default: 50,
    },
    // 文件类型, 例如['png', 'jpg', 'jpeg']
    fileType: {
      type: Array,
      default: () => ["png", "jpg", "jpeg"],
    },
    // 是否显示提示
    isShowTip: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      number: 0,
      uploadList: [],
      dialogImageUrl: "",
      dialogVisible: false,
      hideUpload: false,
      baseUrl: process.env.VUE_APP_BASE_API,
      //uploadImgUrl: process.env.VUE_APP_BASE_API + "/common/upload", // 上传的图片服务器地址
      uploadImgUrl: process.env.VUE_APP_BASE_API + "/common/upload", // 上传的图片服务器地址
      headers: {
        Authorization: "Bearer " + getToken(),
      },
      fileList: [],
      // OSS重定向配置
      ossReplace: process.env.VUE_APP_OSS_REPLACE === 'true',
      ossSrc: process.env.VUE_APP_OSS_SRC,
      ossDst: process.env.VUE_APP_OSS_DST
    };
  },
  computed: {
    // 是否显示提示
    showTip() {
      return this.isShowTip && (this.fileType || this.fileSize);
    },
    // 处理后的文件列表（应用OSS重定向）
    processedFileList() {
      if (!this.ossReplace || !this.ossSrc || this.fileList.length === 0) {
        return this.fileList;
      }
      
      return this.fileList.map(item => {
        const newItem = { ...item };
        if (newItem.url && typeof newItem.url === 'string') {
          newItem.url = this.replaceOssUrl(newItem.url);
        }
        return newItem;
      });
    }
  },
  watch: {
    value: {
      handler(val) {
        if (val) {
          // 首先将值转为数组
          const list = Array.isArray(val) ? val : this.value.split(',');
          // 然后将数组转为对象数组
          this.fileList = list.map(item => {
            if (typeof item === 'string') {
              // 处理传入的URL（可能已经是完整URL或相对路径）
              let url = item;
              if (!url.startsWith('http') && !url.startsWith('//') && !url.startsWith('data:')) {
                // 如果是相对路径，添加基础URL
                url = this.baseUrl + (url.startsWith('/') ? '' : '/') + url;
              }
              
              // 应用OSS重定向（如果需要）
              if (this.ossReplace && url && this.ossSrc) {
                url = this.replaceOssUrl(url);
              }
              
              return { name: item, url: url };
            }
            return item;
          });
        } else {
          this.fileList = [];
          return [];
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    // OSS URL替换方法
    replaceOssUrl(url) {
      if (!url || !this.ossSrc) return url;
      
      try {
        // 创建正则表达式，确保替换所有匹配项
        const srcRegex = new RegExp(this.escapeRegExp(this.ossSrc), 'g');
        return url.replace(srcRegex, this.ossDst || '');
      } catch (error) {
        console.error('OSS URL替换失败:', error);
        return url;
      }
    },
    
    // 转义正则表达式特殊字符
    escapeRegExp(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },
    
    // 上传前loading加载
    handleBeforeUpload(file) {
      let isImg = false;
      if (this.fileType.length) {
        let fileExtension = "";
        if (file.name.lastIndexOf(".") > -1) {
          fileExtension = file.name.slice(file.name.lastIndexOf(".") + 1);
        }
        isImg = this.fileType.some(type => {
          if (file.type.indexOf(type) > -1) return true;
          if (fileExtension && fileExtension.indexOf(type) > -1) return true;
          return false;
        });
      } else {
        isImg = file.type.indexOf("image") > -1;
      }

      if (!isImg) {
        this.$modal.msgError(`文件格式不正确, 请上传${this.fileType.join("/")}图片格式文件!`);
        return false;
      }
      if (file.name.includes(',')) {
        this.$modal.msgError('文件名不正确，不能包含英文逗号!');
        return false;
      }
      if (this.fileSize) {
        const isLt = file.size / 1024 / 1024 < this.fileSize;
        if (!isLt) {
          this.$modal.msgError(`上传头像图片大小不能超过 ${this.fileSize} MB!`);
          return false;
        }
      }
      this.$modal.loading("正在上传图片，请稍候...");
      this.number++;
    },
    // 文件个数超出
    handleExceed() {
      this.$modal.msgError(`上传文件数量不能超过 ${this.limit} 个!`);
    },
    // 上传成功回调
    handleUploadSuccess(res, file) {
      if (res.code === 200) {
        let processedUrl = res.fileName;
        
        // 如果返回的是相对路径，添加基础URL
        if (processedUrl && !processedUrl.startsWith('http') && !processedUrl.startsWith('//')) {
          processedUrl = this.baseUrl + (processedUrl.startsWith('/') ? '' : '/') + processedUrl;
        }
        
        // 应用OSS重定向
        if (this.ossReplace && processedUrl && this.ossSrc) {
          processedUrl = this.replaceOssUrl(processedUrl);
        }
        
        // 原始URL也保存一份（用于emit到父组件）
        const originalUrl = res.fileName;
        this.uploadList.push({ 
          name: originalUrl, 
          url: processedUrl,
          originalUrl: originalUrl // 保存原始URL
        });
        this.uploadedSuccessfully();
      } else {
        this.number--;
        this.$modal.closeLoading();
        this.$modal.msgError(res.msg);
        this.$refs.imageUpload.handleRemove(file);
        this.uploadedSuccessfully();
      }
    },
    // 删除图片
    handleDelete(file) {
      const findex = this.fileList.map(f => f.name).indexOf(file.name);
      if(findex > -1) {
        this.fileList.splice(findex, 1);
        
        // 发送给父组件时使用原始URL
        const listToEmit = this.fileList.map(item => {
          return item.originalUrl || item.name || item.url;
        });
        this.$emit("input", this.listToString(listToEmit));
      }
    },
    // 上传失败
    handleUploadError() {
      this.$modal.msgError("上传图片失败，请重试");
      this.$modal.closeLoading();
    },
    // 上传结束处理
    uploadedSuccessfully() {
      if (this.number > 0 && this.uploadList.length === this.number) {
        this.fileList = this.fileList.concat(this.uploadList);
        this.uploadList = [];
        this.number = 0;
        
        // 发送给父组件时使用原始URL
        const listToEmit = this.fileList.map(item => {
          return item.originalUrl || item.name || item.url;
        });
        this.$emit("input", this.listToString(listToEmit));
        this.$modal.closeLoading();
      }
    },
    // 预览
    handlePictureCardPreview(file) {
      let previewUrl = file.url;
      
      // 确保预览的URL也应用了OSS重定向
      if (this.ossReplace && previewUrl && this.ossSrc) {
        previewUrl = this.replaceOssUrl(previewUrl);
      }
      
      this.dialogImageUrl = previewUrl;
      this.dialogVisible = true;
    },
    // 对象转成指定字符串分隔
    listToString(list, separator) {
      let strs = "";
      separator = separator || ",";
      for (let i in list) {
        if (list[i]) {
          // 移除可能存在的目标地址前缀，保留原始URL
          let url = list[i];
          if (this.ossReplace && this.ossDst && url.startsWith(this.ossDst)) {
            // 如果是替换后的URL，尝试还原为原始URL
            if (url.includes(this.ossDst)) {
              url = url.replace(new RegExp(this.escapeRegExp(this.ossDst), 'g'), this.ossSrc || '');
            }
          }
          strs += url + separator;
        }
      }
      return strs != '' ? strs.substr(0, strs.length - 1) : '';
    },
    
    // 外部调用的方法：手动更新文件列表
    updateFileList(urls) {
      if (urls) {
        const list = Array.isArray(urls) ? urls : urls.split(',');
        this.fileList = list.map(item => {
          if (typeof item === 'string') {
            let url = item;
            if (!url.startsWith('http') && !url.startsWith('//') && !url.startsWith('data:')) {
              url = this.baseUrl + (url.startsWith('/') ? '' : '/') + url;
            }
            
            if (this.ossReplace && url && this.ossSrc) {
              url = this.replaceOssUrl(url);
            }
            
            return { name: item, url: url };
          }
          return item;
        });
      } else {
        this.fileList = [];
      }
    }
  }
};
</script>
<style scoped lang="scss">
// .el-upload--picture-card 控制加号部分
::v-deep.hide .el-upload--picture-card {
    display: none;
}
// 去掉动画效果
::v-deep .el-list-enter-active,
::v-deep .el-list-leave-active {
    transition: all 0s;
}

::v-deep .el-list-enter, .el-list-leave-active {
    opacity: 0;
    transform: translateY(0);
}
</style>