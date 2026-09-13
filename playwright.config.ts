import {defineConfig} from '@playwright/test';
import {existsSync} from 'node:fs';
const chrome='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const port=process.env.PHIELDWORKS_TEST_PORT??'5173';
const url=`http://127.0.0.1:${port}`;
export default defineConfig({testDir:'./tests/browser',timeout:90000,workers:1,use:{baseURL:url,viewport:{width:1440,height:1000},launchOptions:existsSync(chrome)?{executablePath:chrome}:{},screenshot:'only-on-failure'},webServer:{command:`npm run dev -- --port ${port}`,url,reuseExistingServer:!process.env.CI}});
