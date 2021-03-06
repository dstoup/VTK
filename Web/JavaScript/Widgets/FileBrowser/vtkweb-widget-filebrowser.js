/**
 * VTK-Web Widget Library.
 *
 * This module extend jQuery object to add support for graphical components
 * related to File Browsing.
 *
 * @class jQuery.vtk.ui.FileBrowser
 */
(function ($) {

    // =======================================================================
    // ==== Defaults constant values =========================================
    // =======================================================================
    var pathSeparator = '/',
    directives = {
         '.vtk-directory': {
            'directory <-': {
                '@path': function(arg) {
                    return pathToStr(arg.item.path);
                },
                '@class+': function(arg) {
                    return (arg.item.path.length === 1) ? ' active' : '';
                },
                '.vtk-label': 'directory.label',
                'li.vtk-files': {
                    'file <- directory.files': {
                        'div': 'file.label'
                    }
                },
                'li.vtk-dirs': {
                    'dir <- directory.dirs': {
                        'div': 'dir'
                    }
                },
                'li.vtk-path': {
                    'i <- directory.path': {
                        'div': 'i'
                    }//,
                    // filter : function(a) {
                    //     return a.pos < (a.items.length - 1);
                    // }
                }
            }
        }
    },
    fileBrowserGenerator = null;

    $.fn.fileBrowser = function(options) {
        // Handle data with default values
        var opts = $.extend({},$.fn.fileBrowser.defaults, options);

        // Compile template only once
        if(fileBrowserGenerator === null) {
            template = $(opts.template);
            fileBrowserGenerator = template.compile(directives);
        }

        return this.each(function() {
            var me = $(this).empty().addClass('vtk-filebrowser'),
            container = $('<div/>');
            me.append(container);
            me.data('file-list', opts.data);
            me.data('session', opts.session);

            // Generate HTML
            container.render(opts.data, fileBrowserGenerator);

            // Initialize pipelineBrowser (Visibility + listeners)
            initializeListener(me);
        });
    };

    $.fn.updateFileBrowser = function(activeDirectory) {

        return this.each(function() {
            var me = $(this).empty(),
            data = me.data('file-list'),
            container = $('<div/>');
            me.append(container);

            // Generate HTML
            container.render(data, fileBrowserGenerator);

            // Initialize pipelineBrowser (Visibility + listeners)
            initializeListener(me, activeDirectory);
        });
    };

    $.fn.fileBrowser.defaults = {
        template: "#vtk-templates > .vtkweb-widget-filebrowser > div",
        session: null,
        data: [
            { 'label': 'Root', 'path': ['Root'], 'files': [
                {'label': 'can.ex2', 'size': 2345},
                {'label': 'diskout.ex2', 'size': 23345},
            ], 'dirs': ['Cosmo', 'Ensight']},
            { 'label': 'Cosmo',
              'path': ['Root','Cosmo'],
              'files': [
                {'label': 'can.ex2', 'size': 2345},
                {'label': 'diskout.ex2', 'size': 23345},
              ],
              'dirs': ['a','b','c'] },
            { 'label': 'Ensight',
              'path': ['Root','Ensight'],
              'files': [
                {'label': 'can.case', 'size': 2345},
                {'label': 'diskout.case', 'size': 23345},
              ],
              'dirs': [] },
            { 'label': 'a',
               'path': ['Root','Cosmo', 'a'],
               'files': [
                {'label': 'x', 'size': 2345},
                {'label': 'y', 'size': 23345},
               ],
               'dirs': []}
        ]
    };

    // =======================================================================

    function strToPath(pathId) {
        var path = pathId.split(pathSeparator);
        return path.slice(1, path.length);
    }

    // =======================================================================

    function getParent(path) {
        return path.slice(0, path.length - 2);
    }

    // =======================================================================

    function getPath(parentPath, child) {
        return [].concat(parentPath).concat(child);
    }

    // =======================================================================

    function pathToStr(path) {
        //console.log(path);
        var str = pathSeparator + path.join(pathSeparator);
        return str;
    }

    // =======================================================================

    function getRelativePath(parentPath, fileName) {
        return '.' + pathToStr(getPath(parentPath, fileName).slice(1));
    }

    // =======================================================================

    function initializeListener(container, activePath) {
        $('.action', container).click(function(){
            var me = $(this), item = $('div', me), pathStr = me.closest('.vtk-directory').attr('path'), type = me.closest('ul').attr('type');

            if(type === 'path') {
                // Find out the panel to show
                var newPath = pathToStr(strToPath(pathStr).slice(0, me.index() + 1)),
                selector = '.vtk-directory[path="' + newPath + '"]';
                var newActive = $(selector , container).addClass('active');
                if(newActive.length === 1) {
                     $('.vtk-directory', container).removeClass('active');
                     newActive.addClass('active');
                }
            } else if(type === 'dir') {
                // Swicth active panel
                var str = '.vtk-directory[path="' + pathStr + pathSeparator + item.html() + '"]';
                var newActive = $(str, container);
                if(newActive.length === 1) {
                    $('.vtk-directory', container).removeClass('active');
                    newActive.addClass('active');
                    container.trigger({
                        type: 'directory-click',
                        path: pathStr,
                        name: me.text(),
                        relativePath: getRelativePath(strToPath(pathStr), me.text())
                    });
                } else {
                    if(container.data('session')) {
                        var relativePath = (pathStr + '/' + me.text());
                        container.data('session').call('vtk:listServerDirectory', relativePath.substring(1)).then(function(newFiles){
                            container.data('file-list').push(newFiles);
                            container.updateFileBrowser(relativePath);
                        });

                    }
                    container.trigger({
                        type: 'directory-not-found',
                        path: pathStr,
                        name: me.text(),
                        relativePath: getRelativePath(strToPath(pathStr), me.text())
                    });
                }
            } else if(type === 'files') {
                container.trigger({
                    type: 'file-click',
                    path: pathStr,
                    name: me.text(),
                    relativePath: getRelativePath(strToPath(pathStr), me.text())
                });
            }
        });
        if(activePath) {
            $('.vtk-directory',container).removeClass('active');
            $('.vtk-directory[path="' + activePath + '"]',container).addClass('active');
        }

    }

}(jQuery));