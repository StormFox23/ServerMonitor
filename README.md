# ServerMonitor v2.0 - Also Upgraded to Latest Libraries

A modern real-time server monitoring application built with Angular 21 and Node.js, featuring live system metrics visualization with Chart.js.

## 🚀 What's New in v2.0

- **Angular 21**: Upgraded from Angular 8 to the latest stable version
- **Standalone Components**: Modern Angular architecture with standalone components
- **TypeScript 5.5**: Latest TypeScript with strict mode enabled
- **Modern Server**: Node.js with ES modules, Socket.io v4, and systeminformation library
- **Enhanced UI**: Responsive design with modern CSS and dark mode support
- **Docker Support**: Multi-stage Docker builds for production deployment
- **ESLint**: Modern linting replacing TSLint
- **Improved Performance**: Optimized builds and better resource management

## 📋 Prerequisites

- Node.js 20+ 
- npm 10+
- Docker (optional, for containerized deployment)

## 🛠️ Quick Start

### Local Development

1. **Clone and Install Dependencies**
   ```bash
   git clone <repository-url>
   cd ServerMonitor
   
   # Install client dependencies
   cd Client
   npm install
   
   # Install server dependencies
   cd ../Server
   npm install
   ```

2. **Start Development Servers**
   ```bash
   # Start the server (in Server directory)
   npm run dev
   
   # Start the Angular client (in Client directory)
   npm start
   ```

3. **Access the Application**
    - Open browser to `http://localhost:4200`
    - Server runs on port `9500`
    

### Docker Deployment

1. **Production Build**
    ```bash
    docker-compose up --build
    ```

2. **Development with Hot Reload**
    ```bash
    docker-compose -f docker-compose.dev.yml --profile dev up --build
    ```
    
    Access the application at:
    - Angular Client: http://localhost:4201
    - Node.js Server: http://localhost:9501

## 🏗️ Project Structure

```
ServerMonitor/
├── Client/                 # Angular 21 application
│   ├── src/
│   │   ├── app/
│   │   │   ├── app.component.ts      # Standalone main component
│   │   │   ├── app.component.html    # Modern UI template
│   │   │   ├── app.component.css     # Responsive styling
│   │   │   └── app.routes.ts        # Angular 21 routing
│   │   ├── main.ts                   # Bootstrap application
│   │   └── ...
│   ├── package.json                  # Angular 21 dependencies
│   ├── angular.json                  # Angular CLI configuration
│   ├── tsconfig.json                 # TypeScript 5.5 config
│   └── eslint.config.js              # ESLint configuration
├── Server/                 # Node.js backend
│   ├── src/
│   │   └── index.ts               # TypeScript server with Socket.io v4
│   ├── dist/                     # Compiled JavaScript output
│   ├── package.json               # Modern Node.js dependencies
│   └── tsconfig.json              # TypeScript configuration
├── Client/
│   ├── Dockerfile                 # Angular 21 production build
│   ├── Dockerfile.dev             # Angular 21 development build
│   └── nginx.conf                # Nginx configuration
├── Server/
│   ├── Dockerfile                 # Node.js production build
│   └── Dockerfile.dev             # Node.js development build
├── docker-compose.yml             # Production Docker orchestration
├── docker-compose.dev.yml         # Development Docker orchestration
├── start.sh                      # macOS/Linux startup script
├── start.bat                     # Windows startup script
├── MIGRATION_GUIDE.md            # Detailed migration instructions
├── MIGRATION_CHECKLIST.md        # Migration progress tracking
└── README.md                     # This file
```

## 🔧 Configuration

### Environment Variables

**Server Environment (.env)**
```env
PORT=9500
NODE_ENV=development
CORS_ORIGIN=http://localhost:4200
```

**Client Environment (src/environments/)**
```typescript
export const environment = {
  production: false,
  serverUrl: 'http://localhost:9500'
};
```

## 📊 Features

### Real-time Monitoring
- **CPU Usage**: Live CPU utilization with historical data
- **Memory Usage**: Real-time memory consumption visualization
- **System Information**: CPU cores, system type, and more
- **Connection Status**: Visual indicator of server connection

### Modern UI/UX
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark Mode Support**: Automatic dark mode based on system preferences
- **Smooth Animations**: CSS transitions and hover effects
- **Modern Charts**: Interactive Chart.js visualizations

### Developer Experience
- **Hot Reload**: Fast development with live updates
- **Type Safety**: Full TypeScript support with strict mode
- **Modern Tooling**: ESLint, Angular CLI, and modern build pipeline
- **Container Ready**: Docker support for easy deployment

## 🚀 Deployment

### Production Build

```bash
# Build Angular application
cd Client
npm run build

# Start production server
cd ../Server
npm start
```

### Docker Deployment

```bash
# Build and run production container
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Environment-Specific Builds

```bash
# Development
ng build --configuration development

# Production
ng build --configuration production

# Staging (if configured)
ng build --configuration staging
```

## 🔍 Monitoring & Debugging

### Health Checks

```bash
# Check server status
curl http://localhost:9500

# Check application
curl http://localhost:4200
```

### Development Tools

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Run tests
npm test

# Build with watch mode
npm run watch
```

## 🛡️ Security Considerations

- **CORS Configuration**: Proper cross-origin resource sharing setup
- **Input Validation**: Server-side validation for all inputs
- **Error Handling**: Comprehensive error handling and logging
- **Secure WebSocket**: Secure Socket.io connections
- **Environment Variables**: Sensitive data in environment variables

## 📈 Performance Optimizations

### Client Optimizations
- **Bundle Size**: Optimized builds with tree-shaking
- **Lazy Loading**: On-demand component loading
- **Change Detection**: OnPush strategy where applicable
- **Asset Optimization**: Compressed and optimized assets

### Server Optimizations
- **Efficient Monitoring**: Optimized system monitoring intervals
- **Memory Management**: Proper cleanup and resource management
- **Connection Handling**: Efficient WebSocket connection management
- **Error Recovery**: Robust error handling and recovery

## 🔄 Version History

### v2.0.0 (Current)
- ✅ Angular 8 → Angular 21 upgrade
- ✅ Standalone components implementation
- ✅ Modern server architecture with ES modules
- ✅ Socket.io v4 upgrade
- ✅ systeminformation library integration
- ✅ Enhanced UI with responsive design
- ✅ Docker containerization
- ✅ ESLint implementation
- ✅ TypeScript 5.5 with strict mode
- ✅ Server converted to TypeScript
- ✅ Automated startup scripts for development

### v1.0.0 (Legacy)
- Angular 8 application
- Basic server monitoring
- Socket.io v2
- os-monitor library
- Traditional module-based architecture

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the package.json file for details.

## 🆘 Troubleshooting

### Common Issues

1. **Port Conflicts**: Change ports in docker-compose.yml if needed
2. **Dependency Issues**: Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
3. **Socket Connection**: Ensure CORS is properly configured
4. **Build Errors**: Check Node.js and npm versions meet requirements
### Advanced NPM Install Troubleshooting

If `npm install` produces many errors, try these steps to debug and recover:

1. Verify Node & npm versions:
```bash
node -v
npm -v

# If using nvm:
nvm use || nvm install
```

2. Clean and reinstall dependencies (safe for development):
```bash
./bootstrap.sh
```
This removes `node_modules` and `package-lock.json` for each subproject and runs `npm install`.

3. For persistent errors, capture verbose logs for analysis:
```bash
cd Client
npm install --verbose > ~/client-npm-install.log 2>&1

cd ../Server
npm install --verbose > ~/server-npm-install.log 2>&1
```

4. Peer dependency errors with npm 7+ can be skipped temporarily with:
```bash
npm install --legacy-peer-deps
```

5. If native modules fail to build (macOS), you may need:
```bash
xcode-select --install  # Command Line Tools
brew install pkg-config libffi  # if brew is used
```

6. If errors relate to TypeScript mismatch (Angular requires >=5.9.0), make sure the local TypeScript is updated in `Client/package.json` and re-run:
```bash
cd Client
rm -rf node_modules package-lock.json
npm install
npx tsc -v
```

7. If all else fails, clear npm cache and try again:
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

If you want me to inspect, provide the `client-npm-install.log` or `server-npm-install.log` from the above commands.

8. If you see TypeScript module resolution errors like `Cannot find module '@angular/common/http'`, update `moduleResolution` in `Client/tsconfig.json` to `bundler` or `node16` and reinstall dependencies:
```json
{
    "compilerOptions": {
        "moduleResolution": "bundler"
    }
}
```


### Getting Help

- Check [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) for detailed migration information
- Review [MIGRATION_CHECKLIST.md](MIGRATION_CHECKLIST.md) for progress tracking
- Open an issue for bugs or feature requests
- Check the Angular and Node.js documentation for version-specific issues

## 📚 Additional Resources

- [Angular 21 Documentation](https://angular.io/docs)
- [Socket.io v4 Documentation](https://socket.io/docs/v4/)
- [Chart.js Documentation](https://www.chartjs.org/docs/)
- [systeminformation Documentation](https://systeminformation.io/)
- [Docker Documentation](https://docs.docker.com/)