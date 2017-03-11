import {readdirSync, statSync} from 'fs'
import {join, dirname, basename, normalize, resolve, sep} from 'path'

namespace Cd {

    type strings = Array<string>
    //enum TokenStillRemains { Yes, No }

    class Pair<A,B> {
        constructor(public readonly _1: A, public readonly _2: B) {}
    }

    function pre(dir: string, subs: strings): Pair<string, strings> {
        if (isDir(dir))
            return new Pair(dir, subs)
        else {
            const [_dir, _sub] = [dirname(dir), basename(dir)]
            subs.unshift(_sub)

            return pre(_dir, subs)
        }
    }

    function isDir(path: string): boolean {
        try { return statSync(path).isDirectory() }
        catch(e) { return false }
    }

    function find(dirs: strings, subTokens: strings): strings {
        if (!subTokens[0]) return dirs
        else {
            const subToken = subTokens.shift()
            const subTokenLC = subToken.toLowerCase()
            const oneStepDeepDirs =
                dirs
                    .map(dir => readdirSync(dir).reduce((arr, sub) => {
                        const path = join(dir, sub)

                        if (isDir(path) &&
                            (/[A-Z]/.test(subToken) ? sub.indexOf(subToken) === 0 : sub.toLowerCase().indexOf(subTokenLC) === 0))
                            arr.push(path)

                        return arr
                    }, []))
                    .reduce((a, b) => a.concat(b), [])

            if (!oneStepDeepDirs[0])
                return dirs
            else
                return find(oneStepDeepDirs, subTokens)
        }
    }

    export function tab(dir?: string): strings {
        try {
            const resolvedDir = resolve(normalize(dir || "."))

            if (!dir || (isDir(resolvedDir) && new RegExp(sep + "$").test(dir))) {
                const subDirs = readdirSync(resolvedDir).map(s => join(resolvedDir, s)).filter(isDir)

                return subDirs[0] ? subDirs : [resolvedDir]
            }
            else {
                const {_1, _2} = pre(dirname(resolvedDir), [basename(resolvedDir)])

                return find([_1], _2)
            }
        }
        catch(e) { return [dir || ""] }
    }

}


Cd.tab(process.argv[2])
    .forEach(d => console.log(d))
