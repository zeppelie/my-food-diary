import React, { useState, useEffect } from 'react';
import './App.css';
import DateHeader from './components/DateHeader';
import SummaryCard from './components/SummaryCard';
import MealSection from './components/MealSection';
import LanguageSwitcher from './components/LanguageSwitcher';
import UserProfile from './components/UserProfile';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { fetchMealsByDate, saveMealEntry, deleteMealEntry } from './services/dbService';

const DiaryContent = () => {
  const { t } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [meals, setMeals] = useState({
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: []
  });

  // Helper to format date as YYYY-MM-DD
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Fetch meals when date changes
  useEffect(() => {
    const loadMeals = async () => {
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
  }, [currentDate]);

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
    goal: 2200,
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
        <UserProfile />
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
  return (
    <LanguageProvider>
      <DiaryContent />
    </LanguageProvider>
  );
}

export default App;
