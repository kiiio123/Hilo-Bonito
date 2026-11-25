import { initNavigation } from './scripts/navigation.js';
import { initDelivery } from './scripts/delivery.js';
import { initLocations } from './scripts/locations.js';
import { initActivities } from './scripts/activities.js';
import { initBudget } from './scripts/budget.js';
import { initRisk } from './scripts/risk.js';
import { initGoals } from './scripts/goals.js';

const navigation = initNavigation();
const delivery = initDelivery();
initLocations({ ...navigation, ...delivery });
const activities = initActivities(navigation);
initBudget(activities);
activities.bindControls();
initRisk({ ...navigation, ...activities });
initGoals({ ...navigation, ...activities });
navigation.resize();
