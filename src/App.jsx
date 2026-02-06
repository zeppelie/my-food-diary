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
      { name: 'Oatmeal & Blueberries', cals: 350 },
      { name: 'Coffee', cals: 10 }
    ],
    lunch: [
      { name: 'Grilled Chicken Salad', cals: 450 },
      { name: 'Apple', cals: 80 }
    ],
    dinner: [],
    snacks: [
      { name: 'Protein Shake', cals: 150 }
    ]
  });

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
          />

          <MealSection
            title={t('lunch')}
            items={meals.lunch}
          />

          <MealSection
            title={t('dinner')}
            items={meals.dinner}
          />

          <MealSection
            title={t('snacks')}
            items={meals.snacks}
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
