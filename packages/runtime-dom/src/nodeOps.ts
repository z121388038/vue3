import { RendererOptions } from '@vue/runtime-core'

export const svgNS = 'http://www.w3.org/2000/svg'

const doc = (typeof document !== 'undefined' ? document : null) as Document

const templateContainer = doc && /*#__PURE__*/ doc.createElement('template')

export const nodeOps: Omit<RendererOptions<Node, Element>, 'patchProp'> = {

/**
 * 指定容器内插入节点到指定位置
 * @param child：需要插入的节点
 * @param parent: 往哪个容器里面插入节点
 * @param anchor: 插入到哪个节点前面，不传就插入到最后
 */
  insert: (child, parent, anchor) => {
    parent.insertBefore(child, anchor || null)
  },

  // 指定容器内删除某个节点
  remove: child => {
    const parent = child.parentNode
    if (parent) {
      parent.removeChild(child)
    }
  },

  // 创建元素节点
  // createElementNS创建的是带命名空间的元素节点
  createElement: (tag, isSVG, is, props): Element => {
    const el = isSVG
      ? doc.createElementNS(svgNS, tag)
      : doc.createElement(tag, is ? { is } : undefined)

    if (tag === 'select' && props && props.multiple != null) {
      ;(el as HTMLSelectElement).setAttribute('multiple', props.multiple)
    }

    return el
  },

  // 创建文本节点
  createText: text => doc.createTextNode(text),

  // 创建注释节点
  createComment: text => doc.createComment(text),

  // 设置元素节点的value值
  setText: (node, text) => {
    node.nodeValue = text
  },

  // 设置节点文本内容
  setElementText: (el, text) => {
    el.textContent = text
  },

  // 获取某个节点的父节点
  parentNode: node => node.parentNode as Element | null,

  // 返回元素节点之后的兄弟节点（包括文本节点、注释节点即回车、换行、空格、文本等等）；
  nextSibling: node => node.nextSibling,

  // 返回匹配指定 CSS 选择器元素的第一个子元素
  querySelector: selector => doc.querySelector(selector),

  // 把指定的属性设置为空
  setScopeId(el, id) {
    el.setAttribute(id, '')
  },

  // 拷贝节点
  cloneNode(el) {
    const cloned = el.cloneNode(true)
    // #3072
    // - in `patchDOMProp`, we store the actual value in the `el._value` property.
    // - normally, elements using `:value` bindings will not be hoisted, but if
    //   the bound value is a constant, e.g. `:value="true"` - they do get
    //   hoisted.
    // - in production, hoisted nodes are cloned when subsequent inserts, but
    //   cloneNode() does not copy the custom property we attached.
    // - This may need to account for other custom DOM properties we attach to
    //   elements in addition to `_value` in the future.
    if (`_value` in el) {
      ;(cloned as any)._value = (el as any)._value
    }
    return cloned
  },

  // __UNSAFE__
  // Reason: innerHTML.
  // Static content here can only come from compiled templates.
  // As long as the user only uses trusted templates, this is safe.
  // 插入静态节点
  insertStaticContent(content, parent, anchor, isSVG, start, end) {
    // <parent> before | first ... last | anchor </parent>
    const before = anchor ? anchor.previousSibling : parent.lastChild
    // #5308 can only take cached path if:
    // - has a single root node
    // - nextSibling info is still available
    if (start && (start === end || start.nextSibling)) {
      // cached
      while (true) {
        parent.insertBefore(start!.cloneNode(true), anchor)
        if (start === end || !(start = start!.nextSibling)) break
      }
    } else {
      // fresh insert
      templateContainer.innerHTML = isSVG ? `<svg>${content}</svg>` : content
      const template = templateContainer.content
      if (isSVG) {
        // remove outer svg wrapper
        const wrapper = template.firstChild!
        while (wrapper.firstChild) {
          template.appendChild(wrapper.firstChild)
        }
        template.removeChild(wrapper)
      }
      parent.insertBefore(template, anchor)
    }
    return [
      // first
      before ? before.nextSibling! : parent.firstChild!,
      // last
      anchor ? anchor.previousSibling! : parent.lastChild!
    ]
  }
}
