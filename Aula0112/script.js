/**
 * Solucionador de Equações de Segundo Grau
 * Desenvolvido por: MiniMax Agent
 * Funcionalidades: Resolução de equações ax² + bx + c = 0, gráficos, histórico, modo claro/escuro
 */

class EquationSolver {
    constructor() {
        this.chart = null;
        this.history = this.loadHistory();
        this.currentTheme = localStorage.getItem('theme') || 'dark';
        
        this.init();
    }

    init() {
        this.setupTheme();
        this.setupEventListeners();
        this.updateEquationDisplay();
        this.renderHistory();
        this.updateHistoryCount();
    }

    setupTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        const themeIcon = document.querySelector('.theme-icon');
        if (this.currentTheme === 'light') {
            themeIcon.innerHTML = '<path d="M21.64 13a1 1 0 0 0-1.05-.14 8.05 8.05 0 0 1-3.37.73 8.15 8.15 0 0 1-8.03-3.7A8.59 8.59 0 0 1 4.39 8.14a1 1 0 0 0-.3-.78 8 8 0 0 1 0-2.09 1 1 0 0 0-.34-.78 8.59 8.59 0 0 1 3.7-12.86 1 1 0 0 0 1.05-.14 8.59 8.59 0 0 1 12.86 10 1 1 0 0 0-.34.78 8 8 0 0 1 0 2.09 1 1 0 0 0 .3.78 8.59 8.59 0 0 1-3.7 12.86z"/>';
        }
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('equation-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.solveEquation();
        });

        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Clear history
        document.getElementById('clear-history').addEventListener('click', () => {
            this.clearHistory();
        });

        // Toggle calculation details
        document.getElementById('toggle-details').addEventListener('click', () => {
            this.toggleCalculationDetails();
        });

        // Input validation and real-time equation display
        ['coeff-a', 'coeff-b', 'coeff-c'].forEach(id => {
            document.getElementById(id).addEventListener('input', () => {
                this.validateInput(id);
                this.updateEquationDisplay();
            });
        });
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
        
        // Update icon
        const themeIcon = document.querySelector('.theme-icon');
        if (this.currentTheme === 'light') {
            themeIcon.innerHTML = '<path d="M21.64 13a1 1 0 0 0-1.05-.14 8.05 8.05 0 0 1-3.37.73 8.15 8.15 0 0 1-8.03-3.7A8.59 8.59 0 0 1 4.39 8.14a1 1 0 0 0-.3-.78 8 8 0 0 1 0-2.09 1 1 0 0 0-.34-.78 8.59 8.59 0 0 1 3.7-12.86 1 1 0 0 0 1.05-.14 8.59 8.59 0 0 1 12.86 10 1 1 0 0 0-.34.78 8 8 0 0 1 0 2.09 1 1 0 0 0 .3.78 8.59 8.59 0 0 1-3.7 12.86z"/>';
        } else {
            themeIcon.innerHTML = '<path d="M12 3a1 1 0 011 1v1a1 1 0 11-2 0V4a1 1 0 011-1zm4.22 3.78a1 1 0 011.415 1.415l-.707.707a1 1 0 11-1.414-1.415l.707-.707zM20 11a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM6.343 6.343a1 1 0 011.414 0l.707.707A1 1 0 017.07 8.464l-.707-.707a1 1 0 010-1.414zM4 11a1 1 0 011-1H6a1 1 0 110 2H5a1 1 0 01-1-1zm14.243 6.071a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.415l-.707-.708a1 1 0 010-1.414zM12 18a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM7.464 16.536a1 1 0 010 1.414l-.707.708a1 1 0 11-1.415-1.415l.708-.707a1 1 0 011.414 0z"/>';
        }

        // Refresh chart if visible
        if (this.chart) {
            this.updateChart(); // Will rebuild chart with new theme
        }
    }

    validateInput(inputId) {
        const input = document.getElementById(inputId);
        const errorElement = document.getElementById(`error-${inputId.split('-')[1]}`);
        const value = input.value;
        
        // Clear previous error
        input.classList.remove('error');
        errorElement.textContent = '';

        // Validate that it's a number
        if (value && isNaN(parseFloat(value))) {
            this.showInputError(input, errorElement, 'Por favor, insira um número válido');
            return false;
        }

        // Special validation for coefficient 'a'
        if (inputId === 'coeff-a' && value && parseFloat(value) === 0) {
            this.showInputError(input, errorElement, 'O coeficiente "a" não pode ser zero (equação seria de primeiro grau)');
            return false;
        }

        return true;
    }

    showInputError(input, errorElement, message) {
        input.classList.add('error');
        errorElement.textContent = message;
    }

    updateEquationDisplay() {
        const a = document.getElementById('coeff-a').value || 'a';
        const b = document.getElementById('coeff-b').value || 'b';
        const c = document.getElementById('coeff-c').value || 'c';

        // Format numbers for display
        const formatNumber = (num) => {
            if (num === 'a' || num === 'b' || num === 'c') return num;
            
            const parsed = parseFloat(num);
            if (isNaN(parsed)) return num;
            
            // Handle special cases for better display
            if (parsed === 0) return '0';
            if (Math.abs(parsed) >= 1000000 || (Math.abs(parsed) < 0.001 && parsed !== 0)) {
                return parsed.toExponential(3);
            }
            return parsed % 1 === 0 ? parsed.toString() : parsed.toFixed(3);
        };

        document.getElementById('display-a').textContent = formatNumber(a);
        document.getElementById('display-b').textContent = formatNumber(b);
        document.getElementById('display-c').textContent = formatNumber(c);
    }

    solveEquation() {
        const a = parseFloat(document.getElementById('coeff-a').value);
        const b = parseFloat(document.getElementById('coeff-b').value);
        const c = parseFloat(document.getElementById('coeff-c').value);

        // Validate all inputs
        if (!this.validateInput('coeff-a') || !this.validateInput('coeff-b') || !this.validateInput('coeff-c')) {
            this.showNotification('Por favor, corrija os erros nos campos de entrada', 'error');
            return;
        }

        if (isNaN(a) || isNaN(b) || isNaN(c)) {
            this.showNotification('Por favor, preencha todos os campos com números válidos', 'error');
            return;
        }

        if (a === 0) {
            this.showNotification('O coeficiente "a" não pode ser zero. Esta seria uma equação de primeiro grau.', 'error');
            return;
        }

        // Calculate discriminant
        const delta = b * b - 4 * a * c;
        
        let results;
        if (delta > 0) {
            const x1 = (-b + Math.sqrt(delta)) / (2 * a);
            const x2 = (-b - Math.sqrt(delta)) / (2 * a);
            results = {
                type: 'real-distinct',
                delta: delta,
                x1: x1,
                x2: x2,
                message: 'A equação possui duas raízes reais e distintas'
            };
        } else if (delta === 0) {
            const x = -b / (2 * a);
            results = {
                type: 'real-equal',
                delta: delta,
                x: x,
                message: 'A equação possui uma única raiz real (raiz dupla)'
            };
        } else {
            const realPart = -b / (2 * a);
            const imaginaryPart = Math.sqrt(Math.abs(delta)) / (2 * a);
            results = {
                type: 'complex',
                delta: delta,
                realPart: realPart,
                imaginaryPart: imaginaryPart,
                message: 'A equação possui raízes complexas (sem raízes reais)'
            };
        }

        // Display results
        this.displayResults(a, b, c, results);
        
        // Create and display graph
        this.createGraph(a, b, c, results);
        
        // Add to history
        this.addToHistory(a, b, c, results);
        
        // Show success notification
        this.showNotification('Equação resolvida com sucesso!', 'success');
    }

    displayResults(a, b, c, results) {
        const resultsSection = document.getElementById('results-section');
        const statusElement = document.getElementById('result-status');
        const rootsContainer = document.getElementById('roots-container');
        const educationalInfo = document.getElementById('educational-info');

        // Show results section
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth' });

        // Set status badge
        let statusClass, statusIcon, statusText;
        switch (results.type) {
            case 'real-distinct':
                statusClass = 'success';
                statusIcon = '✓';
                statusText = 'Duas raízes reais distintas';
                break;
            case 'real-equal':
                statusClass = 'warning';
                statusIcon = '○';
                statusText = 'Raiz real única (dupla)';
                break;
            case 'complex':
                statusClass = 'error';
                statusIcon = '♢';
                statusText = 'Raízes complexas';
                break;
        }

        statusElement.innerHTML = `
            <div class="status-badge ${statusClass}">
                <span>${statusIcon}</span>
                <span>${statusText}</span>
            </div>
        `;

        // Display roots
        let rootsHTML = '';
        if (results.type === 'real-distinct') {
            rootsHTML = `
                <div class="root-item">
                    <span class="root-label">x₁</span>
                    <span class="root-value">${this.formatNumber(results.x1)}</span>
                </div>
                <div class="root-item">
                    <span class="root-label">x₂</span>
                    <span class="root-value">${this.formatNumber(results.x2)}</span>
                </div>
            `;
        } else if (results.type === 'real-equal') {
            rootsHTML = `
                <div class="root-item">
                    <span class="root-label">x (única)</span>
                    <span class="root-value">${this.formatNumber(results.x)}</span>
                </div>
            `;
        } else {
            rootsHTML = `
                <div class="root-item">
                    <span class="root-label">x₁</span>
                    <span class="root-value">${this.formatNumber(results.realPart)} + ${this.formatNumber(results.imaginaryPart)}i</span>
                </div>
                <div class="root-item">
                    <span class="root-label">x₂</span>
                    <span class="root-value">${this.formatNumber(results.realPart)} - ${this.formatNumber(results.imaginaryPart)}i</span>
                </div>
            `;
        }
        rootsContainer.innerHTML = rootsHTML;

        // Update calculation details
        this.updateCalculationSteps(a, b, c, results);

        // Update educational info
        this.updateEducationalInfo(results);
    }

    updateCalculationSteps(a, b, c, results) {
        const calculationSteps = document.getElementById('calculation-steps');
        
        const aStr = this.formatNumber(a);
        const bStr = this.formatNumber(b);
        const cStr = this.formatNumber(c);
        const deltaStr = this.formatNumber(results.delta);
        
        let stepsHTML = `
            <div class="step">
                <strong>Equação:</strong> ${aStr}x² + ${bStr}x + ${cStr} = 0
            </div>
            <div class="step">
                <strong>Discriminante (Δ):</strong> Δ = b² - 4ac = (${bStr})² - 4(${aStr})(${cStr}) = <span class="step-highlight">${deltaStr}</span>
            </div>
        `;

        if (results.type === 'real-distinct') {
            const x1Str = this.formatNumber(results.x1);
            const x2Str = this.formatNumber(results.x2);
            stepsHTML += `
                <div class="step">
                    <strong>Fórmula de Bhaskara:</strong> x = (-b ± √Δ) / 2a
                </div>
                <div class="step">
                    <strong>x₁ = (-b + √Δ) / 2a = (${this.formatNumber(-b)} + √${deltaStr}) / ${this.formatNumber(2 * a)} = <span class="step-highlight">${x1Str}</span>
                </div>
                <div class="step">
                    <strong>x₂ = (-b - √Δ) / 2a = (${this.formatNumber(-b)} - √${deltaStr}) / ${this.formatNumber(2 * a)} = <span class="step-highlight">${x2Str}</span>
                </div>
            `;
        } else if (results.type === 'real-equal') {
            const xStr = this.formatNumber(results.x);
            stepsHTML += `
                <div class="step">
                    <strong>Como Δ = 0:</strong> x = -b / 2a = ${this.formatNumber(-b)} / ${this.formatNumber(2 * a)} = <span class="step-highlight">${xStr}</span>
                </div>
            `;
        } else {
            const realStr = this.formatNumber(results.realPart);
            const imagStr = this.formatNumber(results.imaginaryPart);
            stepsHTML += `
                <div class="step">
                    <strong>Como Δ < 0:</strong> As raízes são complexas
                </div>
                <div class="step">
                    <strong>Parte real:</strong> -b / 2a = ${this.formatNumber(-b)} / ${this.formatNumber(2 * a)} = <span class="step-highlight">${realStr}</span>
                </div>
                <div class="step">
                    <strong>Parte imaginária:</strong> √|Δ| / 2a = √${this.formatNumber(Math.abs(results.delta))} / ${this.formatNumber(2 * a)} = <span class="step-highlight">${imagStr}</span>
                </div>
                <div class="step">
                    <strong>Raízes:</strong> x₁ = ${realStr} + ${imagStr}i, x₂ = ${realStr} - ${imagStr}i
                </div>
            `;
        }

        calculationSteps.innerHTML = stepsHTML;
    }

    updateEducationalInfo(results) {
        const educationalInfo = document.getElementById('educational-info');
        
        let infoHTML = '';
        
        if (results.type === 'real-distinct') {
            infoHTML = `
                <h4>📊 Interpretação Geométrica</h4>
                <p>Quando Δ > 0, a parábola corta o eixo X em dois pontos diferentes. Isso significa que a equação tem duas soluções reais distintas.</p>
                <p><strong>Dica:</strong> O gráfico da parábola y = ax² + bx + c será positivo (para a > 0) ou negativo (para a < 0) nos extremos.</p>
            `;
        } else if (results.type === 'real-equal') {
            infoHTML = `
                <h4>📊 Interpretação Geométrica</h4>
                <p>Quando Δ = 0, a parábola é tangente ao eixo X, tocando-o em um único ponto. Isso significa que a equação tem uma solução real (raiz dupla).</p>
                <p><strong>Dica:</strong> O vértice da parábola está exatamente no eixo X neste caso.</p>
            `;
        } else {
            infoHTML = `
                <h4>📊 Interpretação Geométrica</h4>
                <p>Quando Δ < 0, a parábola não corta o eixo X, ficando completamente acima (a > 0) ou abaixo (a < 0) dele.</p>
                <p><strong>Sobre números complexos:</strong> As raízes complexas aparecem em pares conjugados e são importantes em muitas áreas da matemática e engenharia.</p>
                <p><strong>Dica:</strong> O gráfico da parábola nunca cruza o eixo X, sendo sempre positivo (a > 0) ou negativo (a < 0).</p>
            `;
        }
        
        educationalInfo.innerHTML = infoHTML;
    }

    createGraph(a, b, c, results) {
        const ctx = document.getElementById('parabola-chart').getContext('2d');
        
        // Destroy existing chart
        if (this.chart) {
            this.chart.destroy();
        }

        // Calculate parabola points
        const xMin = -10;
        const xMax = 10;
        const step = 0.1;
        const points = [];
        
        for (let x = xMin; x <= xMax; x += step) {
            const y = a * x * x + b * x + c;
            points.push({ x: x, y: y });
        }

        // Determine chart colors based on theme
        const isDark = this.currentTheme === 'dark';
        const lineColor = isDark ? '#007AFF' : '#0062CC';
        const pointColor = isDark ? '#34C759' : '#28A745';
        const axisColor = isDark ? '#8E8E93' : '#6C757D';
        const gridColor = isDark ? '#2C2C2E' : '#E9ECEF';

        const datasets = [{
            label: 'Parábola',
            data: points,
            borderColor: lineColor,
            backgroundColor: 'transparent',
            borderWidth: 2.5,
            pointRadius: 0,
            tension: 0.1
        }];

        // Add root points if they are real
        if (results.type === 'real-distinct') {
            datasets.push({
                label: 'Raízes',
                data: [
                    { x: results.x1, y: 0 },
                    { x: results.x2, y: 0 }
                ],
                borderColor: 'transparent',
                backgroundColor: pointColor,
                pointRadius: 8,
                pointHoverRadius: 10,
                showLine: false
            });
        } else if (results.type === 'real-equal') {
            datasets.push({
                label: 'Raiz',
                data: [{ x: results.x, y: 0 }],
                borderColor: 'transparent',
                backgroundColor: pointColor,
                pointRadius: 8,
                pointHoverRadius: 10,
                showLine: false
            });
        }

        // Add vertex point
        const vertexX = -b / (2 * a);
        const vertexY = a * vertexX * vertexX + b * vertexX + c;
        datasets.push({
            label: 'Vértice',
            data: [{ x: vertexX, y: vertexY }],
            borderColor: 'transparent',
            backgroundColor: pointColor,
            pointRadius: 6,
            pointHoverRadius: 8,
            showLine: false
        });

        this.chart = new Chart(ctx, {
            type: 'line',
            data: { datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false // We'll use custom legend
                    },
                    tooltip: {
                        backgroundColor: isDark ? 'rgba(20, 20, 20, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                        titleColor: isDark ? '#E4E4E7' : '#212529',
                        bodyColor: isDark ? '#E4E4E7' : '#212529',
                        borderColor: isDark ? '#2C2C2E' : '#E9ECEF',
                        borderWidth: 1,
                        callbacks: {
                            title: function(context) {
                                return `x = ${context[0].parsed.x.toFixed(3)}`;
                            },
                            label: function(context) {
                                return `y = ${context.parsed.y.toFixed(3)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        grid: {
                            color: gridColor
                        },
                        ticks: {
                            color: axisColor
                        },
                        title: {
                            display: true,
                            text: 'x',
                            color: axisColor
                        }
                    },
                    y: {
                        grid: {
                            color: gridColor
                        },
                        ticks: {
                            color: axisColor
                        },
                        title: {
                            display: true,
                            text: 'y',
                            color: axisColor
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'nearest'
                },
                elements: {
                    point: {
                        hoverBorderWidth: 2
                    }
                }
            }
        });

        // Update graph legend
        this.updateGraphLegend(results, vertexX, vertexY);
    }

    updateGraphLegend(results, vertexX, vertexY) {
        const legend = document.getElementById('graph-legend');
        
        let legendHTML = `
            <div class="legend-item">
                <div class="legend-color primary"></div>
                <span>Parábola y = ${this.formatPolynomial(this.getA(), this.getB(), this.getC())}</span>
            </div>
            <div class="legend-item">
                <div class="legend-color success"></div>
                <span>Vértice (${this.formatNumber(vertexX)}, ${this.formatNumber(vertexY)})</span>
            </div>
        `;
        
        if (results.type === 'real-distinct' || results.type === 'real-equal') {
            const rootType = results.type === 'real-distinct' ? 'raízes' : 'raiz';
            legendHTML += `
                <div class="legend-item">
                    <div class="legend-color success"></div>
                    <span>${rootType} real${results.type === 'real-distinct' ? 'ais' : ''} no eixo X</span>
                </div>
            `;
        } else {
            legendHTML += `
                <div class="legend-item">
                    <div class="legend-color secondary"></div>
                    <span>Sem intersecções reais com o eixo X</span>
                </div>
            `;
        }
        
        legend.innerHTML = legendHTML;
    }

    formatPolynomial(a, b, c) {
        const parts = [];
        
        // Format 'a' term
        if (a !== 0) {
            const aStr = a === 1 ? '' : a === -1 ? '-' : a;
            parts.push(`${aStr}x²`);
        }
        
        // Format 'b' term
        if (b !== 0) {
            const bAbs = Math.abs(b);
            const bStr = bAbs === 1 ? '' : bAbs;
            const sign = b > 0 ? ' + ' : ' - ';
            parts.push(`${sign}${bStr}x`);
        }
        
        // Format 'c' term
        if (c !== 0) {
            const sign = c > 0 ? ' + ' : ' - ';
            const cStr = Math.abs(c);
            parts.push(`${sign}${cStr}`);
        }
        
        // Handle case where all coefficients are zero
        if (parts.length === 0) {
            return '0';
        }
        
        return parts.join('').replace(/\s+/g, '');
    }

    getA() {
        const a = parseFloat(document.getElementById('coeff-a').value);
        return isNaN(a) ? 0 : a;
    }

    getB() {
        const b = parseFloat(document.getElementById('coeff-b').value);
        return isNaN(b) ? 0 : b;
    }

    getC() {
        const c = parseFloat(document.getElementById('coeff-c').value);
        return isNaN(c) ? 0 : c;
    }

    toggleCalculationDetails() {
        const steps = document.getElementById('calculation-steps');
        const button = document.getElementById('toggle-details');
        const icon = button.querySelector('.expand-icon');
        
        steps.classList.toggle('expanded');
        icon.classList.toggle('rotated');
        
        const isExpanded = steps.classList.contains('expanded');
        button.innerHTML = `
            ${isExpanded ? 'Ocultar cálculo' : 'Ver cálculo passo a passo'}
            <svg class="expand-icon ${isExpanded ? 'rotated' : ''}" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 9l6 6 6-6"/>
            </svg>
        `;
    }

    addToHistory(a, b, c, results) {
        const historyItem = {
            id: Date.now(),
            a: a,
            b: b,
            c: c,
            results: results,
            timestamp: new Date(),
            equation: this.formatPolynomial(a, b, c) + ' = 0'
        };
        
        this.history.unshift(historyItem);
        
        // Keep only last 50 items
        if (this.history.length > 50) {
            this.history = this.history.slice(0, 50);
        }
        
        this.saveHistory();
        this.renderHistory();
        this.updateHistoryCount();
    }

    loadHistory() {
        try {
            const saved = localStorage.getItem('equation-history');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading history:', error);
            return [];
        }
    }

    saveHistory() {
        try {
            localStorage.setItem('equation-history', JSON.stringify(this.history));
        } catch (error) {
            console.error('Error saving history:', error);
        }
    }

    renderHistory() {
        const historyList = document.getElementById('history-list');
        
        if (this.history.length === 0) {
            historyList.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary); padding: 2rem;">Nenhuma equação resolvida ainda</p>';
            return;
        }
        
        historyList.innerHTML = this.history.map(item => {
            let resultText;
            switch (item.results.type) {
                case 'real-distinct':
                    resultText = `x₁=${this.formatNumber(item.results.x1)}, x₂=${this.formatNumber(item.results.x2)}`;
                    break;
                case 'real-equal':
                    resultText = `x=${this.formatNumber(item.results.x)}`;
                    break;
                case 'complex':
                    resultText = `raízes complexas`;
                    break;
                default:
                    resultText = 'resultado não disponível';
            }
            
            const timeAgo = this.getTimeAgo(item.timestamp);
            
            return `
                <div class="history-item" onclick="equationSolver.loadFromHistory(${item.id})">
                    <div class="history-equation">${item.equation}</div>
                    <div class="history-result">${resultText}</div>
                    <div class="history-time">${timeAgo}</div>
                </div>
            `;
        }).join('');
    }

    loadFromHistory(id) {
        const item = this.history.find(h => h.id === id);
        if (!item) return;
        
        // Load coefficients
        document.getElementById('coeff-a').value = item.a;
        document.getElementById('coeff-b').value = item.b;
        document.getElementById('coeff-c').value = item.c;
        
        this.updateEquationDisplay();
        
        // Clear any errors
        ['coeff-a', 'coeff-b', 'coeff-c'].forEach(id => {
            document.getElementById(id).classList.remove('error');
            document.getElementById(`error-${id.split('-')[1]}`).textContent = '';
        });
        
        // Solve and display
        this.solveEquation();
        
        this.showNotification('Equação carregada do histórico', 'info');
    }

    clearHistory() {
        if (confirm('Tem certeza que deseja limpar todo o histórico?')) {
            this.history = [];
            this.saveHistory();
            this.renderHistory();
            this.updateHistoryCount();
            this.showNotification('Histórico limpo', 'info');
        }
    }

    updateHistoryCount() {
        const countElement = document.getElementById('history-count');
        const count = this.history.length;
        countElement.textContent = `${count} equação${count !== 1 ? 'ões' : ''} resolvida${count !== 1 ? 's' : ''}`;
    }

    getTimeAgo(timestamp) {
        const now = new Date();
        const then = new Date(timestamp);
        const diffInSeconds = Math.floor((now - then) / 1000);
        
        if (diffInSeconds < 60) {
            return 'agora mesmo';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `há ${minutes} minuto${minutes !== 1 ? 's' : ''}`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `há ${hours} hora${hours !== 1 ? 's' : ''}`;
        } else {
            const days = Math.floor(diffInSeconds / 86400);
            return `há ${days} dia${days !== 1 ? 's' : ''}`;
        }
    }

    formatNumber(num) {
        if (Math.abs(num) >= 1e6 || (Math.abs(num) < 1e-3 && num !== 0)) {
            return num.toExponential(3);
        }
        if (Math.abs(num) < 1e-10) return '0';
        return Math.round(num * 1e6) / 1e6; // 6 decimal places
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notifications');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        container.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Remove notification
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (container.contains(notification)) {
                    container.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize the application
let equationSolver;

document.addEventListener('DOMContentLoaded', () => {
    equationSolver = new EquationSolver();
});

// Voice Recognition (Optional Feature)
class VoiceInput {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.init();
    }

    init() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'pt-BR';
            
            this.recognition.onstart = () => {
                this.isListening = true;
                this.showVoiceStatus(true);
            };
            
            this.recognition.onend = () => {
                this.isListening = false;
                this.showVoiceStatus(false);
            };
            
            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.processVoiceInput(transcript);
            };
            
            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.showVoiceStatus(false);
                equationSolver.showNotification('Erro no reconhecimento de voz', 'error');
            };
        }
    }

    start() {
        if (this.recognition && !this.isListening) {
            this.recognition.start();
        }
    }

    processVoiceInput(transcript) {
        // Simple voice command processing
        // Example: "a igual a 2, b igual a -3, c igual a 5"
        const patterns = {
            a: /(?:a\s*(?:igual\s*a)?|coeficiente\s*a)\s*(?:é\s*|igual\s*a\s*)?(-?\d+(?:\.\d+)?)/i,
            b: /(?:b\s*(?:igual\s*a)?|coeficiente\s*b)\s*(?:é\s*|igual\s*a\s*)?(-?\d+(?:\.\d+)?)/i,
            c: /(?:c\s*(?:igual\s*a)?|coeficiente\s*c)\s*(?:é\s*|igual\s*a\s*)?(-?\d+(?:\.\d+)?)/i
        };

        let foundValues = {};
        
        Object.keys(patterns).forEach(coeff => {
            const match = transcript.match(patterns[coeff]);
            if (match && match[1]) {
                foundValues[coeff] = parseFloat(match[1]);
            }
        });

        // Apply found values
        if (foundValues.a !== undefined) {
            document.getElementById('coeff-a').value = foundValues.a;
        }
        if (foundValues.b !== undefined) {
            document.getElementById('coeff-b').value = foundValues.b;
        }
        if (foundValues.c !== undefined) {
            document.getElementById('coeff-c').value = foundValues.c;
        }

        if (Object.keys(foundValues).length > 0) {
            equationSolver.updateEquationDisplay();
            equationSolver.showNotification('Valores inseridos via voz', 'success');
        } else {
            equationSolver.showNotification('Comando de voz não reconhecido. Tente: "a igual a 2"', 'error');
        }
    }

    showVoiceStatus(isListening) {
        // This would add a voice input button to the UI
        // Implementation left as optional enhancement
    }
}

// Initialize voice input if available
let voiceInput;
document.addEventListener('DOMContentLoaded', () => {
    voiceInput = new VoiceInput();
});

// Add some mathematical utilities for enhanced functionality
class MathUtils {
    static gcd(a, b) {
        return b === 0 ? Math.abs(a) : MathUtils.gcd(b, a % b);
    }

    static simplifyFraction(numerator, denominator) {
        if (denominator === 0) return { numerator: 0, denominator: 1 };
        
        const gcd = MathUtils.gcd(Math.abs(numerator), Math.abs(denominator));
        return {
            numerator: numerator / gcd,
            denominator: denominator / gcd
        };
    }

    static formatFraction(value, maxDenominator = 100) {
        // Convert decimal to fraction for better educational display
        const tolerance = 1e-10;
        let h1 = 1, h2 = 0, k1 = 0, k2 = 1;
        let b = value;
        
        do {
            const a = Math.floor(b);
            const aux = h1; h1 = a * h1 + h2; h2 = aux;
            const aux2 = k1; k1 = a * k1 + k2; k2 = aux2;
            b = 1 / (b - a);
        } while (Math.abs(value - h1 / k1) > value * tolerance);
        
        if (k1 <= maxDenominator) {
            const simplified = MathUtils.simplifyFraction(h1, k1);
            return `${simplified.numerator}/${simplified.denominator}`;
        }
        
        return null; // Too complex
    }
}