# Image to 3D Education Demo

一个把 GPT Image 参考图转换成可交互 3D 知识场景的网页 demo。流程是：GPT Image 生成清晰参考图，Tripo API 转成 GLB，前端用 React + Three.js 在浏览器里渲染，并叠加可点击的教育热点。

这个项目的灵感来自 3DCellForge：把静态知识图片变成可以旋转、点击和讲解的 3D 页面。

## Demo 内容

- 中国独特动物系列：大熊猫、川金丝猴、朱鹮、扬子鳄。
- 代表性车型系列：超跑、电动 GT、拉力车、越野车，并展示部件知识。
- 应用场景系列：昆虫翅膀、青铜器纹样、空气动力学尾翼。

仓库里包含一组已经由 Tripo 生成并缓存的 GLB demo 模型，方便克隆后直接查看效果。你也可以配置自己的 Tripo API key，上传新图片生成新的 3D 模型。

## 技术栈

- React + Vite
- Three.js / @react-three/fiber / @react-three/drei
- Node.js 本地 API 服务
- Tripo image-to-3D API

## 准备 Tripo

如果只看仓库内置 demo 模型，可以先不配置 Tripo key。

如果要上传新图片并调用 Tripo 生成模型，复制环境变量文件：

```bash
cp .env.example .env.local
```

然后在 `.env.local` 填入：

```bash
TRIPO_API_KEY=your_tripo_api_key
```

注意：Tripo 的 Studio credit 和 API credit 不是完全一回事。如果要通过 API 生成 GLB，需要确认 API credit 可用。API key 只在 Node 后端读取，不会打进前端包。

## 启动

安装依赖：

```bash
npm install
```

开两个终端。第一个启动本地 API：

```bash
npm run dev:api
```

第二个启动前端：

```bash
npm run dev
```

前端默认会从 Vite 给出的地址打开，通常是：

```bash
http://127.0.0.1:5173/
```

如果 5173 被占用，Vite 会自动换到 5174 等端口。后端默认地址：

```bash
http://127.0.0.1:8787/
```

## 使用流程

1. 打开前端页面。
2. 在 Animals / Cars / Cases 之间切换案例。
3. 拖拽旋转 3D 模型，点击模型热点或右侧知识点。
4. 如果要生成新模型，点击 Add image 上传参考图，再点击 Tripo 3D。
5. 等待状态变成 GLB model ready 后，模型会替换到当前条目。

## 安全说明

- 不要提交 `.env.local`。
- `node_modules`、`dist` 和日志文件不应进入 Git。
- 已生成的 demo GLB 模型用于展示效果；如果你不需要内置模型，可以删除 `.generated-models` 并自行生成。
