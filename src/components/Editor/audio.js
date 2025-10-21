import Quill from 'quill'

const BlockEmbed = Quill.import('blots/block/embed') // 修复：正确的导入路径
const Link = Quill.import('formats/link')

class Audio extends BlockEmbed {
    static create(value) {
        const node = super.create(value)
        node.setAttribute('controls', 'controls')
        node.setAttribute('src', this.sanitize(value))
        node.setAttribute('controlsList', 'nodownload')
        node.setAttribute('style', 'max-width: 100%;') // 添加样式控制
        return node
    }

    static sanitize(url) {
        return Link.sanitize(url)
    }

    static value(domNode) {
        return domNode.getAttribute('src')
    }

    // 添加 formats 方法以便正确处理属性
    static formats(domNode) {
        return {}
    }

    format(name, value) {
        if (name === 'height' || name === 'width') {
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

Audio.blotName = 'audio'
Audio.className = 'ql-audio'
Audio.tagName = 'audio'

export default Audio