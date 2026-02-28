export class AIEngine {
    constructor() {
        this.categories = {
            'Food': ['starbucks', 'mcdonalds', 'kfc', 'cafe', 'restaurant', 'pizza', 'burger', 'lunch', 'dinner', 'swiggy', 'zomato'],
            'Transport': ['uber', 'ola', 'taxi', 'train', 'bus', 'fuel', 'petrol', 'parking', 'metro'],
            'Shopping': ['amazon', 'flipkart', 'nike', 'apple', 'shoes', 'clothes', 'electronics', 'mall'],
            'Housing': ['rent', 'electricity', 'water', 'internet', 'maintenance', 'furniture'],
            'Entertainment': ['netflix', 'spotify', 'movie', 'cinema', 'gym', 'gaming', 'ps5']
        };
    }

    /**
     * Predictive categorization based on description
     */
    suggestCategory(description) {
        if (!description) return null;

        const desc = description.toLowerCase();
        for (const [cat, keywords] of Object.entries(this.categories)) {
            if (keywords.some(k => desc.includes(k))) {
                return cat;
            }
        }
        return 'Other';
    }

    /**
     * Generate dynamic insights based on transaction history
     */
    generateInsights(transactions, stats) {
        const insights = [];

        if (transactions.length === 0) {
            insights.push({
                type: 'info',
                title: 'Start your journey',
                message: "Add your first transaction to unlock AI-powered financial insights."
            });
            return insights;
        }

        // 1. Balance Check
        if (stats.balance < 100 && stats.balance > 0) {
            insights.push({
                type: 'warning',
                title: 'Low Balance Orbit',
                message: "Your current balance is dipping below $100. Consider postponing non-essential shopping."
            });
        }

        // 2. Spending Trend
        const foodSpending = transactions
            .filter(t => t.category === 'Food')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);

        if (foodSpending > stats.totalExpenses * 0.4) {
            insights.push({
                type: 'advice',
                title: 'Gastronomic Peak',
                message: "A large portion of your spending is on Food & Drinks. Home cooking could save you ~15% this month."
            });
        }

        // 3. Positive Reinforcement
        if (stats.totalIncome > stats.totalExpenses && stats.totalExpenses > 0) {
            insights.push({
                type: 'success',
                title: 'Positive Trajectory',
                message: "Great job! You're spending less than you earn. Your emergency fund is growing."
            });
        }

        return insights;
    }

    /**
     * Advanced analysis for Insights View
     */
    getDeepAnalysis(transactions, budgets) {
        const analysis = {
            savingsRate: 0,
            volatileCategories: [],
            projections: {}
        };

        if (transactions.length < 5) return null;

        const income = transactions.filter(t => t.category === 'Income').reduce((s, t) => s + t.amount, 0);
        const expenses = transactions.filter(t => t.category !== 'Income').reduce((s, t) => s + t.amount, 0);

        if (income > 0) {
            analysis.savingsRate = ((income - expenses) / income) * 100;
        }

        // Detect high variance categories
        const spendingByCat = {};
        transactions.filter(t => t.category !== 'Income').forEach(t => {
            if (!spendingByCat[t.category]) spendingByCat[t.category] = [];
            spendingByCat[t.category].push(t.amount);
        });

        Object.entries(spendingByCat).forEach(([cat, amounts]) => {
            if (amounts.length > 2) {
                const avg = amounts.reduce((a, b) => a + b) / amounts.length;
                const max = Math.max(...amounts);
                if (max > avg * 1.5) {
                    analysis.volatileCategories.push(cat);
                }
            }
        });

        return analysis;
    }
}
