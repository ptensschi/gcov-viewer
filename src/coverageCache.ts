import { loadGcovData, GcovFileData } from './gcovInterface';

/**
 * Cache for all data loaded using gcov. This way we don't have to reload
 * it everytime the user looks at a new file.
 */
export class CoverageCache {
    dataByFile: Map<string, GcovFileData> = new Map();
    demangledNames: Map<string, string> = new Map();
    loadedGcdaFiles: string[] = [];

    async loadGcdaFiles(gcdaPaths: string[]) {
        const gcovDataArray = await loadGcovData(gcdaPaths);

        for (const gcovData of gcovDataArray) {
            const workingDir = gcovData.current_working_directory;
            for (const fileData of gcovData.files) {
                var path = require("path");
                const absolutePath = path.resolve(workingDir + '/' + fileData.file);
                const cachedFileData = this.dataByFile.get(absolutePath);
                if (cachedFileData === undefined) {
                    this.dataByFile.set(absolutePath, {
                        file: absolutePath,
                        lines: [...fileData.lines],
                        functions: [...fileData.functions],
                    });
                }
                else {
                    cachedFileData.lines.push(...fileData.lines);
                    cachedFileData.functions.push(...fileData.functions);
                }

                for (const functionData of fileData.functions) {
                    this.demangledNames.set(functionData.name, functionData.demangled_name);
                }
            }
        }
        this.loadedGcdaFiles.push(...gcdaPaths);
    }

    hasData() {
        return this.loadedGcdaFiles.length > 0;
    }
};
