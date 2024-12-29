import { defineConfig } from 'vite';
import { resolve, relative, dirname } from 'path';
import { promises as fs } from 'fs';

// input에 사용할 HTML 파일 경로들을 미리 정의
const inputFiles = {
    index: resolve(__dirname, 'index.html'),
    notice: resolve(__dirname, 'notice.html'),
    login: resolve(__dirname, 'src/pages/main/login/login.html'),
    callback: resolve(__dirname, 'src/pages/main/callback/callback.html'),
    join: resolve(__dirname, 'src/pages/main/join/join.html'),
    onboarding: resolve(__dirname, 'src/pages/main/onboarding/onboarding.html'),
    collect: resolve(__dirname, 'src/pages/main/collect/collect.html'),
    history: resolve(__dirname, 'src/pages/service/history/history.html'),
    dashboard: resolve(__dirname, 'src/pages/service/dashboard/dashboard.html'),
    setting: resolve(__dirname, 'src/pages/service/setting/setting.html'),
    faq: resolve(__dirname, 'src/pages/service/faq/faq.html'),
    exit: resolve(__dirname, 'src/pages/service/exit/exit.html'),
};

// 빈 디렉토리를 삭제하는 재귀 함수
async function removeEmptyDirs(dir) {
    const files = await fs.readdir(dir);

    if (files.length === 0) {
        await fs.rmdir(dir);
        // console.log(`Deleted empty directory: ${dir}`);
        const parentDir = dirname(dir);
        if (parentDir !== dir) {
            await removeEmptyDirs(parentDir); // 부모 디렉토리도 확인
        }
    }
}

export default defineConfig({
    resolve: {
        alias: {
            '@components': resolve(__dirname, '/src/components'),
            '@pages': resolve(__dirname, '/src/pages'),
            '@scripts': resolve(__dirname, '/src/scripts'),
            '@constant': resolve(__dirname, '/src/scripts/constants'),
            '@library': resolve(__dirname, '/src/scripts/libraries'),
            '@manager': resolve(__dirname, '/src/scripts/managers'),
            '@styles': resolve(__dirname, '/src/styles'),
        },
    },
    build: {
        outDir: 'dist', // 빌드 결과물 저장 폴더
        rollupOptions: {
            input: inputFiles, // input에 미리 정의한 파일 경로들 사용
            output: {
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name.endsWith('.css')) {
                        return 'styles/[name].[ext]'; // CSS 파일은 styles 폴더에 저장
                    }
                    return 'assets/[name].[ext]'; // 기타 자산 파일은 assets 폴더에 저장
                },
                chunkFileNames: 'scripts/[name].js', // JS 파일은 scripts 폴더에 저장
                entryFileNames: 'scripts/[name].js', // 엔트리 JS 파일도 scripts 폴더에 저장
            },
        },
    },
    plugins: [
        {
            name: 'move-html',
            closeBundle: async () => {
                // HTML 파일들이 빌드된 위치에서 이동하는 경로를 설정
                const targetDir = resolve(__dirname, 'dist/');
                await fs.mkdir(targetDir, { recursive: true });

                // inputFiles의 키와 값 사용하여 빌드된 HTML 파일을 이동
                for (const [key, src] of Object.entries(inputFiles)) {
                    // src 경로에서 프로젝트 디렉토리 상대 경로 계산
                    const relativePath = relative(__dirname, src);

                    // dist 폴더 안에서 해당 파일 경로를 만들기
                    const distPath = resolve(__dirname, 'dist', relativePath);

                    const destPath = resolve(targetDir, `${key}.html`); // 이동할 경로

                    try {
                        await fs.rename(distPath, destPath); // 빌드된 파일을 이동
                        // 빈 디렉토리 삭제
                        const dirPath = dirname(distPath); // 파일이 있었던 디렉토리
                        await removeEmptyDirs(dirPath); // 빈 디렉토리 삭제 시도
                    } catch (err) {
                        console.error(`Failed to move ${key}.html:`, err);
                    }
                }
            },
        },
    ],
});
