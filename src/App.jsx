import React, { useState, useEffect } from 'react';
import './App.css';
import DateHeader from './components/DateHeader';
import SummaryCard from './components/SummaryCard';
import MealSection from './components/MealSection';
import LanguageSwitcher from './components/LanguageSwitcher';
import UserProfile from './components/UserProfile';
import AuthPage from './components/AuthPage';
import ResetPasswordPage from './components/ResetPasswordPage';
import ProfilePage from './components/ProfilePage';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { fetchMealsByDate, saveMealEntry, deleteMealEntry, getAuthToken, removeAuthToken, fetchUserProfile } from './services/dbService';

const DiaryContent = ({ user, onLogout, onProfileClick }) => {
  const { t } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [userGoal, setUserGoal] = useState(2000);
  const [meals, setMeals] = useState({
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: []
  });

  // Fetch user profile for goals
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await fetchUserProfile();
        if (profile && profile.daily_kcal_goal) {
          setUserGoal(profile.daily_kcal_goal);
        }
      } catch (err) {
        console.error('Failed to load profile goal:', err);
      }
    };
    loadProfile();
  }, [user]);

  // Helper to format date as YYYY-MM-DD
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Fetch meals when date changes
  useEffect(() => {
    const loadMeals = async () => {
      if (!user) return;
      const dateStr = formatDate(currentDate);
      const data = await fetchMealsByDate(dateStr);

      // Categorize meals by type
      const categorized = {
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: []
      };

      data.forEach(item => {
        if (categorized[item.meal_type]) {
          categorized[item.meal_type].push(item);
        }
      });

      setMeals(categorized);
    };

    loadMeals();
  }, [currentDate, user]);

  // Handler to add food to a specific meal
  const handleAddFood = async (mealType, foodItem) => {
    try {
      const dateStr = formatDate(currentDate);
      const payload = {
        date: dateStr,
        meal_type: mealType,
        name: foodItem.name,
        brand: foodItem.brand,
        serving_size: foodItem.servingSize,
        calories: foodItem.cals,
        proteins: foodItem.macros?.proteins,
        carbs: foodItem.macros?.carbs,
        fats: foodItem.macros?.fats,
        image_url: foodItem.imageUrl
      };

      const result = await saveMealEntry(payload);

      // Update local state with the saved item (including the DB ID)
      setMeals(prevMeals => ({
        ...prevMeals,
        [mealType]: [...prevMeals[mealType], { ...payload, id: result.id }]
      }));
    } catch (error) {
      alert('Error saving meal: ' + error.message);
    }
  };

  // Handler to delete food (if needed)
  const handleDeleteFood = async (mealType, id) => {
    const success = await deleteMealEntry(id);
    if (success) {
      setMeals(prevMeals => ({
        ...prevMeals,
        [mealType]: prevMeals[mealType].filter(item => item.id !== id)
      }));
    }
  };

  // Calculate summary stats
  const calculateTotals = () => {
    const allMeals = Object.values(meals).flat();
    const totals = {
      food: 0,
      carbs: 0,
      protein: 0,
      fat: 0
    };

    allMeals.forEach(meal => {
      totals.food += meal.calories || 0;
      totals.carbs += meal.carbs || 0;
      totals.protein += meal.proteins || 0;
      totals.fat += meal.fats || 0;
    });

    return totals;
  };

  const totals = calculateTotals();
  const summaryData = {
    goal: userGoal,
    food: totals.food,
    exercise: 0
  };

  const macroData = {
    carbs: { used: Math.round(totals.carbs), total: 250 },
    protein: { used: Math.round(totals.protein), total: 160 },
    fat: { used: Math.round(totals.fat), total: 70 }
  };

  return (
    <div className="app-wrapper">
      <div className="top-bar">
        <LanguageSwitcher />
        <UserProfile user={user} onLogout={onLogout} onProfileClick={onProfileClick} />
      </div>
      <div className="app-container">

        <div className="date-header-wrapper">
          <DateHeader
            currentDate={currentDate}
            onDateChange={setCurrentDate}
          />
        </div>

        <div className="summary-wrapper">
          <SummaryCard
            summary={summaryData}
            macros={macroData}
          />
        </div>

        <div className="meals-wrapper">
          <MealSection
            title={t('breakfast')}
            items={meals.breakfast}
            onAddFood={(foodItem) => handleAddFood('breakfast', foodItem)}
            onDeleteItem={(id) => handleDeleteFood('breakfast', id)}
          />

          <MealSection
            title={t('lunch')}
            items={meals.lunch}
            onAddFood={(foodItem) => handleAddFood('lunch', foodItem)}
            onDeleteItem={(id) => handleDeleteFood('lunch', id)}
          />

          <MealSection
            title={t('dinner')}
            items={meals.dinner}
            onAddFood={(foodItem) => handleAddFood('dinner', foodItem)}
            onDeleteItem={(id) => handleDeleteFood('dinner', id)}
          />

          <MealSection
            title={t('snacks')}
            items={meals.snacks}
            onAddFood={(foodItem) => handleAddFood('snacks', foodItem)}
            onDeleteItem={(id) => handleDeleteFood('snacks', id)}
          />
        </div>

      </div>
    </div>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentPage, setCurrentPage] = useState('auth'); // auth, diary, reset

  useEffect(() => {
    // Check for reset password path
    if (window.location.pathname === '/reset-password') {
      setCurrentPage('reset');
      setIsInitializing(false);
      return;
    }

    const token = getAuthToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser(payload);
        setCurrentPage('diary');
      } catch (e) {
        removeAuthToken();
        setCurrentPage('auth');
      }
    } else {
      setCurrentPage('auth');
    }
    setIsInitializing(false);
  }, []);

  const handleLogout = () => {
    removeAuthToken();
    setUser(null);
    setCurrentPage('auth');
  };

  if (isInitializing) return <div className="loading-screen">Girt...</div>;

  return (
    <LanguageProvider>
      {currentPage === 'reset' ? (
        <ResetPasswordPage onComplete={() => setCurrentPage('auth')} />
      ) : currentPage === 'profile' ? (
        <ProfilePage onBack={() => setCurrentPage('diary')} />
      ) : user ? (
        <DiaryContent
          user={user}
          onLogout={handleLogout}
          onProfileClick={() => setCurrentPage('profile')}
        />
      ) : (
        <AuthPage onAuthSuccess={(userData) => {
          setUser(userData);
          setCurrentPage('diary');
        }} />
      )}
    </LanguageProvider>
  );
}

export default App;
