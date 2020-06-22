const path = require('path');
const fs = require('fs');

const babylon = require('babylon');
const t = require('@babel/types');
const traverse = require('@babel/traverse').default;
const generator = require('@babel/generator').default;

const ejs = require('ejs');
const { SyncHook } = require('tapable');

class Compiler {
    constructor(config) {
        this.config = config;
        this.entryId ;
        this.modules = {};
        this.entry = config.entry;
        this.root = process.cwd();

        this.hooks = {
            entryOption: new SyncHook(),
            compile: new SyncHook(),
            afterCompile: new SyncHook(),
            afterPlugins: new SyncHook(),
            run: new SyncHook(),
            emit: new SyncHook(),
            done: new SyncHook()
        }

        let plugins = this.config.plugins;
        if (Array.isArray(plugins)) {
            plugins.forEach(plugin => {
                plugin.apply(this);
            })
        }

        this.hooks.afterPlugins.call();
    }

    getSource(modulePath) {
        let source = fs.readFileSync(modulePath, 'utf-8');
        if (this.config.module) {
            const rules = this.config.module.rules;
            rules.forEach(rule => {
                const { test, use} = rule;
                if (test.test(modulePath)) {
                    let len = use.length - 1;
                    function normalRule() {
                        let loader = require(use[len--]);
                        source = loader(source);
                        if (len >= 0) {
                            normalRule();
                        }
                    }
                    normalRule();
                }
            })
        }
        return source;
    }

    parse(source, parentPath) {
        let dependencies = [];
        const ast = babylon.parse(source);
        traverse(ast, {
            CallExpression(p) {
                const node = p.node;
                if (node.callee.name === 'require') {
                    node.callee.name = '__webpack_require__';
                    let moduleName = node.arguments[0].value;
                    moduleName = moduleName + (path.extname(moduleName) ? '' : '.js');
                    moduleName = './' + path.join(parentPath, moduleName);
                    node.arguments = [t.stringLiteral(moduleName)];
                    dependencies.push(moduleName);
                }
            }
        })

        const sourceCode = generator(ast).code;

        return {
            sourceCode,
            dependencies
        }
    }

    buildModule(modulePath, isEntry) {
        const source = this.getSource(modulePath);
        let moduleName = './' + path.relative(this.root, modulePath);
        if (isEntry) {
            this.entryId = moduleName;
        }

        let {sourceCode, dependencies} = this.parse(source, path.dirname(moduleName));

        this.modules[moduleName] = sourceCode;

        dependencies && dependencies.length > 0 && dependencies.forEach(module => this.buildModule(path.join(this.root, module), false));

    }

    emitFile() {
        const template = this.getSource(path.join(__dirname, '../template/template.ejs'));
        const content = ejs.render(template, {
            entryId: this.entryId,
            modules: this.modules
        })

        fs.writeFileSync(path.join(this.config.output.path, this.config.output.filename), content);
    }

    run() {
        this.hooks.run.call();

        this.hooks.compile.call();
        this.buildModule(path.resolve(this.root, this.entry), true);
        this.hooks.afterCompile.call();

        this.emitFile();
        this.hooks.emit.call();

        this.hooks.done.call();
    }
};

module.exports = Compiler;