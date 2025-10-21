import Quill from 'quill'

const BlockEmbed = Quill.import('blots/block/embed') // 修复：保持一致的导入路径
const Link = Quill.import('formats/link')

const ATTRIBUTES = ['height', 'width']

class Video extends BlockEmbed {
    static create(value) {
        const node = super.create(value)
        node.setAttribute('controls', 'controls')
        node.setAttribute('style', 'max-width: 100%; height: auto;') // 添加响应式样式
        node.setAttribute('src', this.sanitize(value))
        return node
    }

    static formats(domNode) {
        return ATTRIBUTES.reduce((formats, attribute) => {
            if (domNode.hasAttribute(attribute)) {
                formats[attribute] = domNode.getAttribute(attribute)
            }
            return formats
        }, {})
    }

    static sanitize(url) {
        return Link.sanitize(url)
    }

    static value(domNode) {
        return domNode.getAttribute('src')
    }

    format(name, value) {
        if (ATTRIBUTES.indexOf(name) > -1) {
            if (value) {
                this.domNode.setAttribute(name, value)
            } else {
                this.domNode.removeAttribute(name)
            }
        } else {
            super.format(name, value)
        }
    }
}

Video.blotName = 'video'
Video.className = 'ql-video'
Video.tagName = 'video'

export default Video