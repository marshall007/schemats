#! /usr/bin/env node
/**
 * Commandline interface
 * Created by xiamx on 2016-08-10.
 */

import * as fs from 'fs'
import { Options } from '../src/index'
import { processString } from 'typescript-formatter'

(async () => {
    try {
        const options = Options.fromArgv()
        const ts = await options.generate()

        const { dest, fileName } = await processString(options.output, ts, {
            replace: false,
            verify: false,
            tsconfig: true,
            tslint: true,
            editorconfig: true,
            tsfmt: true,
            vscode: false,
            tsconfigFile: null,
            tslintFile: null,
            vscodeFile: null,
            tsfmtFile: null
        })

        fs.writeFileSync(fileName, dest)
    } catch (e) {
        console.error(e)
        process.exit(1)
    } finally {
        process.exit()
    }
})()
