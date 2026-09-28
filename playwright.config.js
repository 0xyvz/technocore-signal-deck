const {defineConfig}=require('@playwright/test');
const port=Number(process.env.TEST_PORT || 5193);
module.exports=defineConfig({
  testDir:'test', testMatch:/\.e2e\.js$/, timeout:30000,
  use:{baseURL:`http://127.0.0.1:${port}`,screenshot:'only-on-failure'},
  webServer:{command:`node server.js ${port}`,url:`http://127.0.0.1:${port}/api/health`,reuseExistingServer:false,timeout:30000},
});
