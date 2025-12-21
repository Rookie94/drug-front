<template>
  <div class="upload-file">
    <el-upload
      multiple
      :action="uploadFileUrl"
      :before-upload="handleBeforeUpload"
      :file-list="processedFileList"
      :limit="limit"
      :on-error="handleUploadError"
      :on-exceed="handleExceed"
      :on-success="handleUploadSuccess"
      :show-file-list="false"
      :headers="headers"
      class="upload-file-uploader"
      ref="fileUpload"
    >
      <!-- 上传按钮 -->
      <el-button size="mini" type="primary">选取文件</el-button>
      <!-- 上传提示 -->
      <div class="el-upload__tip" slot="tip" v-if="showTip">
        请上传
        <template v-if="fileSize"> 大小不超过 <b style="color: #f56c6c">{{ fileSize }}MB</b> </template>
        <template v-if="fileType"> 格式为 <b style="color: #f56c6c">{{ fileType.join("/") }}</b> </template>
        的文件
      </div>
    </el-upload>

    <!-- 文件列表 -->
    <transition-group class="upload-file-list el-upload-list el-upload-list--text" name="el-fade-in-linear" tag="ul">
      <li :key="file.url" class="el-upload-list__item ele-upload-list__item-content" v-for="(file, index) in processedFileList">
        <el-link :href="file.processedUrl || file.url" :underline="false" target="_blank">
          <span class="el-icon-document"> {{ getFileName(file.name) }} </span>
        </el-link>
        <div class="ele-upload-list__item-content-action">
          <el-link :underline="false" @click="handleDelete(index)" type="danger">删除</el-link>
        </div>
      </li>
    </transition-group>
  </div>
</template>

<script>
import { getToken } from "@/utils/auth";

export default {
  name: "FileUpload",
  props: {
    // 值
    value: [String, Object, Array],
    // 数量限制
    limit: {
      type: Number,
      default: 5,
    },
    // 大小限制(MB)
    fileSize: {
      type: Number,
      default: 5,
    },
    // 文件类型, 例如['png', 'jpg', 'jpeg']
    fileType: {
      type: Array,
      default: () => ["doc", "xls", "ppt", "txt", "pdf"],
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
      baseUrl: process.env.VUE_APP_BASE_API,
      uploadFileUrl: process.env.VUE_APP_BASE_API + "/common/upload", // 上传文件服务器地址
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
  watch: {
    value: {
      handler(val) {
        if (val) {
          let temp = 1;
          // 首先将值转为数组
          const list = Array.isArray(val) ? val : this.value.split(',');
          // 然后将数组转为对象数组
          this.fileList = list.map(item => {
            let fileObj = {};
            if (typeof item === "string") {
              let url = item;
              // 如果传入的是相对路径，添加基础URL
              if (!url.startsWith('http') && !url.startsWith('//') && !url.startsWith('data:')) {
                url = this.baseUrl + (url.startsWith('/') ? '' : '/') + url;
              }
              
              // 应用OSS重定向（如果需要）
              let processedUrl = url;
              if (this.ossReplace && processedUrl && this.ossSrc) {
                processedUrl = this.replaceOssUrl(processedUrl);
              }
              
              fileObj = { 
                name: item, 
                url: url,
                processedUrl: processedUrl  // 存储处理后的URL用于显示和下载
              };
            } else {
              // 如果已经是对象，确保有processedUrl属性
              let url = item.url || '';
              let processedUrl = url;
              if (this.ossReplace && processedUrl && this.ossSrc) {
                processedUrl = this.replaceOssUrl(processedUrl);
              }
              fileObj = {
                ...item,
                url: url,
                processedUrl: processedUrl
              };
            }
            fileObj.uid = item.uid || new Date().getTime() + temp++;
            return fileObj;
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
  computed: {
    // 是否显示提示
    showTip() {
      return this.isShowTip && (this.fileType || this.fileSize);
    },
    // 处理后的文件列表（应用OSS重定向）
    processedFileList() {
      return this.fileList.map(item => {
        // 确保每个文件对象都有处理后的URL
        if (!item.processedUrl && item.url) {
          let processedUrl = item.url;
          if (this.ossReplace && processedUrl && this.ossSrc) {
            processedUrl = this.replaceOssUrl(processedUrl);
          }
          return {
            ...item,
            processedUrl: processedUrl
          };
        }
        return item;
      });
    }
  },
  methods: {
    // OSS URL替换方法
    replaceOssUrl(url) {
      if (!url || !this.ossSrc) return url;
      
      try {
        // 转义正则表达式特殊字符
        const escapeRegExp = (string) => {
          return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        };
        
        const srcRegex = new RegExp(escapeRegExp(this.ossSrc), 'g');
        return url.replace(srcRegex, this.ossDst || '');
      } catch (error) {
        console.error('OSS URL替换失败:', error);
        return url;
      }
    },
    
    // 上传前校检格式和大小
    handleBeforeUpload(file) {
      // 校检文件类型
      if (this.fileType) {
        const fileName = file.name.split('.');
        const fileExt = fileName[fileName.length - 1];
        const isTypeOk = this.fileType.indexOf(fileExt) >= 0;
        if (!isTypeOk) {
          this.$modal.msgError(`文件格式不正确, 请上传${this.fileType.join("/")}格式文件!`);
          return false;
        }
      }
      // 校检文件名是否包含特殊字符
      if (file.name.includes(',')) {
        this.$modal.msgError('文件名不正确，不能包含英文逗号!');
        return false;
      }
      // 校检文件大小
      if (this.fileSize) {
        const isLt = file.size / 1024 / 1024 < this.fileSize;
        if (!isLt) {
          this.$modal.msgError(`上传文件大小不能超过 ${this.fileSize} MB!`);
          return false;
        }
      }
      this.$modal.loading("正在上传文件，请稍候...");
      this.number++;
      return true;
    },
    // 文件个数超出
    handleExceed() {
      this.$modal.msgError(`上传文件数量不能超过 ${this.limit} 个!`);
    },
    // 上传失败
    handleUploadError(err) {
      this.$modal.msgError("上传文件失败，请重试");
      this.$modal.closeLoading();
    },
    // 上传成功回调
    handleUploadSuccess(res, file) {
      if (res.code === 200) {
        let originalUrl = res.fileName;
        let processedUrl = originalUrl;
        
        // 如果返回的是相对路径，添加基础URL
        if (processedUrl && !processedUrl.startsWith('http') && !processedUrl.startsWith('//')) {
          processedUrl = this.baseUrl + (processedUrl.startsWith('/') ? '' : '/') + processedUrl;
        }
        
        // 应用OSS重定向
        if (this.ossReplace && processedUrl && this.ossSrc) {
          processedUrl = this.replaceOssUrl(processedUrl);
        }
        
        this.uploadList.push({ 
          name: originalUrl, 
          url: originalUrl,  // 原始URL
          processedUrl: processedUrl,  // 处理后的URL
          originalUrl: originalUrl  // 保存原始URL用于emit
        });
        this.uploadedSuccessfully();
      } else {
        this.number--;
        this.$modal.closeLoading();
        this.$modal.msgError(res.msg);
        this.$refs.fileUpload.handleRemove(file);
        this.uploadedSuccessfully();
      }
    },
    // 删除文件
    handleDelete(index) {
      if (index >= 0 && index < this.fileList.length) {
        this.fileList.splice(index, 1);
        // 发送给父组件时使用原始URL
        const listToEmit = this.fileList.map(item => {
          return item.originalUrl || item.name || item.url;
        });
        this.$emit("input", this.listToString(listToEmit));
      }
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
    // 获取文件名称
    getFileName(name) {
      if (!name) return "";
      
      // 如果name是完整URL，提取文件名部分
      let fileName = name;
      if (name.lastIndexOf("/") > -1) {
        fileName = name.slice(name.lastIndexOf("/") + 1);
      }
      
      // 如果文件名很长，可以截断显示
      if (fileName.length > 30) {
        const extIndex = fileName.lastIndexOf('.');
        if (extIndex > -1) {
          const namePart = fileName.substring(0, extIndex);
          const extPart = fileName.substring(extIndex);
          if (namePart.length > 27) {
            return namePart.substring(0, 27) + '...' + extPart;
          }
        }
        return fileName.substring(0, 30) + '...';
      }
      
      return fileName;
    },
    // 对象转成指定字符串分隔
    listToString(list, separator) {
      let strs = "";
      separator = separator || ",";
      for (let i in list) {
        if (list[i]) {
          let url = list[i];
          // 如果传入了处理后的URL，尝试还原为原始URL
          if (this.ossReplace && this.ossDst && url.includes(this.ossDst)) {
            // 如果是替换后的URL，尝试还原为原始URL
            const escapeRegExp = (string) => {
              return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            };
            url = url.replace(new RegExp(escapeRegExp(this.ossDst), 'g'), this.ossSrc || '');
            
            // 移除baseUrl前缀（如果需要）
            if (url.startsWith(this.baseUrl)) {
              url = url.substring(this.baseUrl.length);
              if (url.startsWith('/')) {
                url = url.substring(1);
              }
            }
          }
          strs += url + separator;
        }
      }
      return strs != '' ? strs.substr(0, strs.length - 1) : '';
    },
    
    // 清空文件列表
    clearFiles() {
      this.fileList = [];
      this.uploadList = [];
      this.$emit("input", "");
    },
    
    // 获取文件列表（返回处理后的URL）
    getFiles() {
      return this.processedFileList;
    },
    
    // 获取原始文件列表（返回原始URL）
    getOriginalFiles() {
      return this.fileList.map(item => item.originalUrl || item.name || item.url);
    },
    
    // 外部调用：手动设置文件列表
    setFileList(fileUrls) {
      if (fileUrls) {
        const list = Array.isArray(fileUrls) ? fileUrls : fileUrls.split(',');
        this.fileList = list.map((item, index) => {
          let url = item;
          let processedUrl = url;
          
          // 如果传入的是相对路径，添加基础URL
          if (!url.startsWith('http') && !url.startsWith('//') && !url.startsWith('data:')) {
            url = this.baseUrl + (url.startsWith('/') ? '' : '/') + url;
            processedUrl = url;
          }
          
          // 应用OSS重定向
          if (this.ossReplace && processedUrl && this.ossSrc) {
            processedUrl = this.replaceOssUrl(processedUrl);
          }
          
          return {
            name: item,
            url: url,
            processedUrl: processedUrl,
            originalUrl: item,
            uid: new Date().getTime() + index
          };
        });
        
        // 通知父组件更新
        const listToEmit = this.fileList.map(item => item.originalUrl);
        this.$emit("input", this.listToString(listToEmit));
      } else {
        this.fileList = [];
        this.$emit("input", "");
      }
    }
  }
};
</script>

<style scoped lang="scss">
.upload-file-uploader {
  margin-bottom: 5px;
}
.upload-file-list .el-upload-list__item {
  border: 1px solid #e4e7ed;
  line-height: 2;
  margin-bottom: 10px;
  position: relative;
}
.upload-file-list .ele-upload-list__item-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: inherit;
}
.ele-upload-list__item-content-action .el-link {
  margin-right: 10px;
}
</style>