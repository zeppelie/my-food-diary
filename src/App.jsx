import React, { useState } from 'react';
import './App.css';
import DateHeader from './components/DateHeader';
import SummaryCard from './components/SummaryCard';
import MealSection from './components/MealSection';
import LanguageSwitcher from './components/LanguageSwitcher';
import { LanguageProvider, useLanguage } from './context/LanguageContext';

const DiaryContent = () => {
  const { t } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());

  const [meals, setMeals] = useState({
    breakfast: [
      { name: 'Avena e Mirtilli', cals: 350 },
      { name: 'Caffè', cals: 10 }
    ],
    lunch: [
      { name: 'Insalata di Pollo Grigliato', cals: 450 },
      { name: 'Mela', cals: 80 }
    ],
    dinner: [],
    snacks: [
      { name: 'Shake Proteico', cals: 150 }
    ]
  });

  // Handler to add food to a specific meal
  const handleAddFood = (mealType, foodItem) => {
    setMeals(prevMeals => ({
      ...prevMeals,
      [mealType]: [...prevMeals[mealType], foodItem]
    }));
  };

  return (
    <div className="app-wrapper">
      <LanguageSwitcher />
      <div className="app-container">

        <div className="date-header-wrapper">
          <DateHeader
            currentDate={currentDate}
            onDateChange={setCurrentDate}
          />
        </div>

        <div className="summary-wrapper">
          <SummaryCard />
        </div>

        <div className="meals-wrapper">
          <MealSection
            title={t('breakfast')}
            items={meals.breakfast}
            onAddFood={(foodItem) => handleAddFood('breakfast', foodItem)}
          />

          <MealSection
            title={t('lunch')}
            items={meals.lunch}
            onAddFood={(foodItem) => handleAddFood('lunch', foodItem)}
          />

          <MealSection
            title={t('dinner')}
            items={meals.dinner}
            onAddFood={(foodItem) => handleAddFood('dinner', foodItem)}
          />

          <MealSection
            title={t('snacks')}
            items={meals.snacks}
            onAddFood={(foodItem) => handleAddFood('snacks', foodItem)}
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
