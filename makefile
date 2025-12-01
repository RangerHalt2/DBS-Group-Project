make:
	cd backend/;node server.js &
	cd frontend/;npm install vite;npm run build;npm run preview