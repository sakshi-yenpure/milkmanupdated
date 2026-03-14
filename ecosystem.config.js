module.exports = {
  apps: [
    {
      name: 'milkman-backend',
      script: 'manage.py',
      args: 'runserver 0.0.0.0:8000',
      interpreter: 'python',
      cwd: './backend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PYTHONUNBUFFERED: '1'
      },
      error_file: '../logs/backend-error.log',
      out_file: '../logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    },
    {
      name: 'milkman-frontend',
      script: 'npx',
      args: 'serve -s dist -l 5173',
      cwd: './frontend',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production'
      },
      error_file: '../logs/frontend-error.log',
      out_file: '../logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    },
    {
      name: 'milkman-admin',
      script: 'npx',
      args: 'serve -s dist -l 5175',
      cwd: './adminpanel',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production'
      },
      error_file: '../logs/admin-error.log',
      out_file: '../logs/admin-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    }
  ]
};
