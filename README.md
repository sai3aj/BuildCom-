# Civil Materials Store

A modern e-commerce platform for construction materials built with React and Django.

## Features

- Browse construction materials by category
- Search for specific products
- Add items to cart
- Place orders with Cash on Delivery
- Responsive design for all devices

## Tech Stack

### Frontend
- React
- Chakra UI
- React Router
- Axios

### Backend
- Django
- Django REST Framework
- SQLite (for development)

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/Scripts/activate  # On Windows
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. Create a superuser:
   ```bash
   python manage.py createsuperuser
   ```

6. Start the development server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

## Usage

1. Access the admin panel at `http://localhost:8000/admin` to add products and categories
2. Visit `http://localhost:3000` to view the store
3. Browse products, add them to cart, and place orders

## Contributing

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License. 