;(function($, window, document, undefined) {

	'use strict'

	var pluginName = 'treeview'

	var Tree = function(element, options) {

		this.$element = $(element)
		this._element = element
		this._elementId = this._element.id

		this.tree = []
		this.nodes = []
		this.selectedNode = {}
		
		this._init(options)

	}

	Tree.defaults = {

		levels: 1,

		expandIcon: 'glyphicon glyphicon-chevron-right',
        collapseIcon: 'glyphicon glyphicon-chevron-down',
		
		enableLinks: false,
		showTags: false,

		expandActiveTree: true

	}

	Tree.prototype = {

		remove: function() {
			this._destroy()
			$.removeData(this, 'plugin_' + pluginName)
		},

		_getHrefActive: function() {
			return document.URL
		},

		_destroy: function() {

			if (this.initialized) {
				this.$wrapper.remove()
				this.$wrapper = null

				this._unsubscribeEvents()
			}

			this.initialized = false
		},

		_init: function(options) {
		
			if (options.data) {
				if (typeof options.data === 'string') {
					options.data = $.parseJSON(options.data)
				}
				this.tree = $.extend(true, [], options.data)
				delete options.data
			}

			this.options = $.extend({}, Tree.defaults, options)

			this._setInitialLevels(this.tree, 0)

			this._destroy()
			this._subscribeEvents()
			this._render()
		},

		_unsubscribeEvents: function() {
			this.$element.off('click')
		},

		_subscribeEvents: function() {
			this._unsubscribeEvents()
			this.$element.on('click', $.proxy(this._clickHandler, this))
		},

		_clickHandler: function(event) {

			if (!this.options.enableLinks) {
				event.preventDefault()
			}
			
			var target = $(event.target),
				classList = target.attr('class') ? target.attr('class').split(' ') : [],
				node = this._findNode(target)

			if ((classList.indexOf('click-expand') != -1) ||
				(classList.indexOf('click-collapse') != -1)) {

				this._toggleNodes(node)
				this._render()

			} else if (node) {
				this._setSelectedNode(node)
			}

		},

		_findNode: function(target) {

			var nodeId = target.closest('li.list-group-item').attr('data-nodeid'),
				node = this.nodes[nodeId]

			if (!node) {
				console.log('Error: node does not exist')
			}

			return node
		},

		/**
		 * recursice function to check if the page is last tree
		 * node tree
		 * true if yes or false if not
		 */
		_findNodeByHref: function(node) {

			var self = this
			
			var href = self._getHrefActive()

			var nodes = node.nodes ? node.nodes : node._nodes ? node._nodes : false

			var r = false

			if (nodes) {

				$.each(nodes, function(id, n) {

					if (n.href === href) {
						r = true
						return
					}
					if (!r) {
						r = self._findNodeByHref(n)
					}

				})

				if (r) {
					return true
				} else {
					return false
				}

			} else {
				return false
			}

		},

		_triggerNodeSelectedEvent: function(node) {
			this.$element.trigger('nodeSelected', [$.extend(true, {}, node)])
		},

		_setSelectedNode: function(node) {

			if (!node) {
				return
			}
			
			if (node === this.selectedNode) {
				this.selectedNode = {}
			} else {
				this._triggerNodeSelectedEvent(this.selectedNode = node)
			}
			
			this._render()
		},

		_setInitialLevels: function(nodes, level) {

			if (!nodes) {
				return
			}
			
			level += 1

			var self = this
			$.each(nodes, function addNodes(id, node) {

				if (level >= self.options.levels && (!self.options.expandActiveTree || !self._findNodeByHref(node))) {
					self._toggleNodes(node)
				}

				var nodes = node.nodes ? node.nodes : node._nodes ? node._nodes : undefined
				if (nodes) {
					return self._setInitialLevels(nodes, level)
				}
			})
		},

		_toggleNodes: function(node) {

			if (!node.nodes && !node._nodes) {
				return
			}

			if (node.nodes) {
				node._nodes = node.nodes
				delete node.nodes
			} else {
				node.nodes = node._nodes
				delete node._nodes
			}
		},

		_render: function() {

			var self = this

			if (!self.initialized) {

				self.$element.addClass(pluginName)
				self.$wrapper = $(self._template.list)
				
				self.initialized = true
			}

			self.$element.empty().append(self.$wrapper.empty())

			self.nodes = []
			self._buildTree(self.tree, 0)
		},

		_buildTree: function(nodes, level) {

			if (!nodes) {
				return
			}

			level += 1

			var self = this
			$.each(nodes, function addNodes(id, node) {

				node.nodeId = self.nodes.length
				self.nodes.push(node)

				var treeItem = $(self._template.item)
					.addClass('node-level-' + level)
					.addClass((node === self.selectedNode) ? 'node-selected' : '')
					.attr('data-nodeid', node.nodeId)
					.addClass(self._buildClassOverride(node))

				var indent_limit = (node.nodes || node._nodes) ? level - 1 : level
				for (var i = 0; i < indent_limit; i++) {
					treeItem.append(self._template.indent)
				}

				if (node._nodes) {

					treeItem
						.append($(self._template.iconWrapper)
							.append($(self._template.icon)
								.addClass('click-expand')
								.addClass(self.options.expandIcon)))

				} else if (node.nodes) {

					treeItem
						.append($(self._template.iconWrapper)
							.append($(self._template.icon)
								.addClass('click-collapse')
								.addClass(self.options.collapseIcon)))

				}

				if (self.options.enableLinks) {
					treeItem
						.append($(self._template.link)
							.attr('href', node.href)
							.append(node.text))
				} else {
					treeItem.append(node.text)
				}

				if (self.options.showTags && node.tags) {
					$.each(node.tags, function addTag(id, tag) {
						treeItem
							.append($(self._template.badge)
								.append(tag))
					})
				}

				self.$wrapper.append(treeItem)

				if (node.nodes) {
					return self._buildTree(node.nodes, level)
				}
			});
		},

		_buildClassOverride: function(n) {

			var c = ''

			if (n.nodes) {
				c += 'open '
			}

			if (n.nodes || n._nodes) {
				c += 'has-child '
			}

			var href = this._getHrefActive()
			if (n.href == href) {
				c += 'active '
			}

			return c
		},

		_template: {
			list: '<ul class="list-group"></ul>',
			item: '<li class="list-group-item"></li>',
			indent: '<span class="indent"></span>',
			iconWrapper: '<span class="icon"></span>',
			icon: '<i></i>',
			link: '<a href="#"></a>',
			badge: '<span class="badge"></span>'
		}

	};

	var logError = function(message) {
        if (window.console) {
            window.console.error(message)
        }
    }

	$.fn[pluginName] = function(options, args) {

		return this.each(function() {

			var self = $.data(this, 'plugin_' + pluginName)

			if (typeof options === 'string') {

				if (!self) {
					logError('Not initialized, can not call method : ' + options)
				} else if (!$.isFunction(self[options]) || options.charAt(0) === '_') {
					logError('No such method : ' + options)
				} else {
					if (typeof args === 'string') {
						args = [args]
					}
					self[options].apply(self, args)
				}
			}
			else {

				if (!self) {
					$.data(this, 'plugin_' + pluginName, new Tree(this, $.extend(true, {}, options)))
				} else {
					self._init(options)
				}
			}
		})
	}

})(jQuery, window, document);