
        document.addEventListener('DOMContentLoaded', function() {
            // DOM Elements
            const csvInput = document.getElementById('csvInput');
            const fileInput = document.getElementById('fileInput');
            const uploadArea = document.getElementById('uploadArea');
            const previewBtn = document.getElementById('previewBtn');
            const cleanBtn = document.getElementById('cleanBtn');
            const resetBtn = document.getElementById('resetBtn');
            const copyBtn = document.getElementById('copyBtn');
            const downloadBtn = document.getElementById('downloadBtn');
            const loadExample = document.getElementById('loadExample');
            const fileName = document.getElementById('fileName');
            const previewSection = document.getElementById('previewSection');
            const issuesList = document.getElementById('issuesList');
            const issuesContainer = document.getElementById('issuesContainer');
            const notification = document.getElementById('notification');
            
            // Cleaning options
            const removeEmptyRows = document.getElementById('removeEmptyRows');
            const removePartialRows = document.getElementById('removePartialRows');
            const trimWhitespace = document.getElementById('trimWhitespace');
            const removeEmptyColumns = document.getElementById('removeEmptyColumns');
            const normalizeHeaders = document.getElementById('normalizeHeaders');
            const delimiterRadios = document.querySelectorAll('input[name="delimiter"]');
            const quoteChar = document.getElementById('quoteChar');
            
            // Stats elements
            const originalRows = document.getElementById('originalRows');
            const cleanedRows = document.getElementById('cleanedRows');
            const removedRows = document.getElementById('removedRows');
            const originalCols = document.getElementById('originalCols');
            const cleanedCols = document.getElementById('cleanedCols');
            
            // Table elements
            const tableHeader = document.getElementById('tableHeader');
            const tableBody = document.getElementById('tableBody');
            
            // Example CSV data
            const exampleCSV = `Name,Email,Phone,Department,Notes
John Doe,john@example.com,555-1234,Engineering,"Works on frontend"
Jane Smith,jane@example.com,555-5678,Marketing,
Robert Johnson,robert@example.com,555-9012,Sales,"Senior sales rep"
,,,,
Alice Brown,,555-1122,HR,"New hire"
Bob Wilson,bob@example.com,,Engineering,
,charlie@example.com,555-3344,,
David Lee,david@example.com,555-5566,Finance,""
Eva Green,eva@example.com,555-7788,Marketing,"Marketing lead"`;

            // State variables
            let originalData = [];
            let cleanedData = [];
            let currentDelimiter = ',';
            let currentQuoteChar = '"';
            let headers = [];
            let issues = [];
            
            // Load example CSV
            loadExample.addEventListener('click', function() {
                csvInput.value = exampleCSV;
                fileName.textContent = '';
                showNotification('Example CSV data loaded');
            });
            
            // File upload handling
            uploadArea.addEventListener('click', function(e) {
                if (e.target.closest('button')) {
                    fileInput.click();
                }
            });
            
            fileInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (!file) return;
                
                fileName.textContent = `Uploaded file: ${file.name}`;
                
                const reader = new FileReader();
                reader.onload = function(event) {
                    csvInput.value = event.target.result;
                    showNotification(`File "${file.name}" loaded successfully`);
                };
                reader.readAsText(file);
            });
            
            // Drag and drop functionality
            uploadArea.addEventListener('dragover', function(e) {
                e.preventDefault();
                uploadArea.style.backgroundColor = '#f0f2ff';
            });
            
            uploadArea.addEventListener('dragleave', function() {
                uploadArea.style.backgroundColor = '';
            });
            
            uploadArea.addEventListener('drop', function(e) {
                e.preventDefault();
                uploadArea.style.backgroundColor = '';
                
                const file = e.dataTransfer.files[0];
                if (!file) return;
                
                // Check if it's a CSV or text file
                if (!file.name.match(/\.(csv|txt)$/i)) {
                    showNotification('Please upload a CSV or text file', 'error');
                    return;
                }
                
                fileName.textContent = `Uploaded file: ${file.name}`;
                fileInput.files = e.dataTransfer.files;
                
                const reader = new FileReader();
                reader.onload = function(event) {
                    csvInput.value = event.target.result;
                    showNotification(`File "${file.name}" loaded successfully`);
                };
                reader.readAsText(file);
            });
            
            // Reset button
            resetBtn.addEventListener('click', function() {
                csvInput.value = '';
                fileName.textContent = '';
                previewSection.classList.remove('active');
                issuesList.classList.remove('active');
                fileInput.value = '';
                showNotification('All inputs cleared');
            });
            
            // Update delimiter when radio changes
            delimiterRadios.forEach(radio => {
                radio.addEventListener('change', function() {
                    if (this.value === 'comma') currentDelimiter = ',';
                    else if (this.value === 'semicolon') currentDelimiter = ';';
                    else if (this.value === 'tab') currentDelimiter = '\t';
                    else if (this.value === 'auto') currentDelimiter = detectDelimiter(csvInput.value);
                });
            });
            
            // Update quote char when select changes
            quoteChar.addEventListener('change', function() {
                currentQuoteChar = this.value === 'none' ? '' : this.value;
            });
            
            // Preview cleaned data
            previewBtn.addEventListener('click', function() {
                const csvText = csvInput.value.trim();
                if (!csvText) {
                    showNotification('Please enter CSV data first', 'error');
                    return;
                }
                
                // Detect delimiter if auto is selected
                if (document.querySelector('input[name="delimiter"]:checked').value === 'auto') {
                    currentDelimiter = detectDelimiter(csvText);
                }
                
                // Parse CSV
                const parseResult = parseCSV(csvText, currentDelimiter, currentQuoteChar);
                originalData = parseResult.data;
                headers = parseResult.headers;
                
                if (originalData.length === 0) {
                    showNotification('No valid CSV data found', 'error');
                    return;
                }
                
                // Clean the data
                const cleanResult = cleanCSV(originalData, headers);
                cleanedData = cleanResult.data;
                issues = cleanResult.issues;
                
                // Update stats
                updateStats(originalData, cleanedData);
                
                // Display issues if any
                displayIssues(issues);
                
                // Display preview table
                displayPreviewTable(cleanedData, cleanResult.cleanedHeaders);
                
                // Show preview section
                previewSection.classList.add('active');
                
                showNotification(`Preview generated: ${cleanedData.length} rows after cleaning`);
            });
            
            // Clean and download CSV
            cleanBtn.addEventListener('click', function() {
                if (cleanedData.length === 0) {
                    showNotification('Please preview the data first', 'error');
                    return;
                }
                
                // Convert cleaned data back to CSV
                const csvContent = convertToCSV(cleanedData, headers, currentDelimiter, currentQuoteChar);
                
                // Create download link
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                
                link.setAttribute('href', url);
                link.setAttribute('download', 'cleaned_data.csv');
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                showNotification('Cleaned CSV file downloaded');
            });
            
            // Copy cleaned CSV to clipboard
            copyBtn.addEventListener('click', function() {
                if (cleanedData.length === 0) {
                    showNotification('No data to copy', 'error');
                    return;
                }
                
                const csvContent = convertToCSV(cleanedData, headers, currentDelimiter, currentQuoteChar);
                navigator.clipboard.writeText(csvContent)
                    .then(() => showNotification('Cleaned CSV copied to clipboard'))
                    .catch(err => showNotification('Failed to copy CSV', 'error'));
            });
            
            // Download cleaned CSV (from preview section)
            downloadBtn.addEventListener('click', function() {
                cleanBtn.click();
            });
            
            // Helper function to detect delimiter
            function detectDelimiter(text) {
                // Count occurrences of common delimiters in first few lines
                const lines = text.split('\n').slice(0, 5);
                const commaCount = lines.reduce((count, line) => count + (line.match(/,/g) || []).length, 0);
                const semicolonCount = lines.reduce((count, line) => count + (line.match(/;/g) || []).length, 0);
                const tabCount = lines.reduce((count, line) => count + (line.match(/\t/g) || []).length, 0);
                
                // Return the most common delimiter
                if (tabCount > commaCount && tabCount > semicolonCount) return '\t';
                if (semicolonCount > commaCount && semicolonCount > tabCount) return ';';
                return ','; // Default to comma
            }
            
            // Helper function to parse CSV
            function parseCSV(text, delimiter, quoteChar) {
                const lines = text.split('\n').filter(line => line.trim() !== '');
                if (lines.length === 0) return { headers: [], data: [] };
                
                // Get headers from first line
                let headers = parseCSVLine(lines[0], delimiter, quoteChar);
                
                // Parse data rows
                const data = [];
                for (let i = 1; i < lines.length; i++) {
                    const row = parseCSVLine(lines[i], delimiter, quoteChar);
                    
                    // Ensure row has same number of columns as headers
                    const paddedRow = [...row];
                    while (paddedRow.length < headers.length) paddedRow.push('');
                    while (paddedRow.length > headers.length) headers.push(`Column_${headers.length + 1}`);
                    
                    data.push(paddedRow);
                }
                
                return { headers, data };
            }
            
            // Helper function to parse a single CSV line
            function parseCSVLine(line, delimiter, quoteChar) {
                const result = [];
                let current = '';
                let inQuotes = false;
                
                for (let i = 0; i < line.length; i++) {
                    const char = line[i];
                    const nextChar = line[i + 1];
                    
                    if (char === quoteChar && quoteChar !== '') {
                        // Handle quoted fields
                        if (inQuotes && nextChar === quoteChar) {
                            // Escaped quote
                            current += quoteChar;
                            i++; // Skip next character
                        } else {
                            // Start or end of quotes
                            inQuotes = !inQuotes;
                        }
                    } else if (char === delimiter && !inQuotes) {
                        // End of field
                        result.push(current);
                        current = '';
                    } else {
                        // Regular character
                        current += char;
                    }
                }
                
                // Add the last field
                result.push(current);
                
                return result;
            }
            
            // Helper function to clean CSV data
            function cleanCSV(data, headers) {
                let cleanedData = [...data];
                let cleanedHeaders = [...headers];
                const issues = [];
                
                // 1. Trim whitespace if enabled
                if (trimWhitespace.checked) {
                    cleanedData = cleanedData.map(row => 
                        row.map(cell => typeof cell === 'string' ? cell.trim() : cell)
                    );
                    cleanedHeaders = cleanedHeaders.map(header => header.trim());
                }
                
                // 2. Normalize headers if enabled
                if (normalizeHeaders.checked) {
                    cleanedHeaders = cleanedHeaders.map((header, index) => {
                        if (!header || header.trim() === '') {
                            return `Column_${index + 1}`;
                        }
                        
                        // Convert to lowercase, replace spaces with underscores
                        return header
                            .toString()
                            .toLowerCase()
                            .replace(/\s+/g, '_')
                            .replace(/[^a-z0-9_]/gi, '');
                    });
                    
                    // Check for duplicate headers
                    const headerCount = {};
                    cleanedHeaders.forEach((header, index) => {
                        if (headerCount[header]) {
                            headerCount[header]++;
                            cleanedHeaders[index] = `${header}_${headerCount[header]}`;
                            issues.push(`Duplicate header "${header}" renamed to "${cleanedHeaders[index]}"`);
                        } else {
                            headerCount[header] = 1;
                        }
                    });
                }
                
                // 3. Remove empty rows if enabled
                const originalRowCount = cleanedData.length;
                if (removeEmptyRows.checked) {
                    cleanedData = cleanedData.filter(row => {
                        const isEmpty = row.every(cell => !cell || cell.toString().trim() === '');
                        if (isEmpty) {
                            issues.push(`Removed empty row`);
                        }
                        return !isEmpty;
                    });
                }
                
                // 4. Remove rows with empty required columns if enabled
                if (removePartialRows.checked) {
                    // For this example, consider first 2 columns as required
                    const requiredColumns = Math.min(2, cleanedHeaders.length);
                    cleanedData = cleanedData.filter((row, index) => {
                        const hasMissingRequired = row.slice(0, requiredColumns).some(cell => !cell || cell.toString().trim() === '');
                        if (hasMissingRequired) {
                            issues.push(`Removed row with empty required column(s)`);
                        }
                        return !hasMissingRequired;
                    });
                }
                
                // 5. Remove empty columns if enabled
                if (removeEmptyColumns.checked) {
                    const columnCount = cleanedHeaders.length;
                    const columnsToRemove = [];
                    
                    for (let col = 0; col < columnCount; col++) {
                        const isEmptyColumn = cleanedData.every(row => !row[col] || row[col].toString().trim() === '');
                        if (isEmptyColumn) {
                            columnsToRemove.push(col);
                            issues.push(`Removed empty column "${cleanedHeaders[col]}"`);
                        }
                    }
                    
                    // Remove columns in reverse order to maintain indices
                    columnsToRemove.reverse().forEach(col => {
                        cleanedHeaders.splice(col, 1);
                        cleanedData = cleanedData.map(row => {
                            row.splice(col, 1);
                            return row;
                        });
                    });
                }
                
                // Count removed rows
                const removedRowCount = originalRowCount - cleanedData.length;
                if (removedRowCount > 0) {
                    issues.push(`Removed ${removedRowCount} empty or invalid rows`);
                }
                
                return {
                    data: cleanedData,
                    cleanedHeaders,
                    issues
                };
            }
            
            // Helper function to convert data back to CSV
            function convertToCSV(data, headers, delimiter, quoteChar) {
                const escapeQuotes = quoteChar !== '';
                const quote = quoteChar || '';
                
                // Create header row
                const headerRow = headers.map(header => {
                    let cell = header.toString();
                    if (escapeQuotes && cell.includes(quoteChar)) {
                        cell = cell.replace(new RegExp(quoteChar, 'g'), quoteChar + quoteChar);
                    }
                    return escapeQuotes && (cell.includes(delimiter) || cell.includes('\n') || cell.includes(quoteChar)) 
                        ? quote + cell + quote 
                        : cell;
                }).join(delimiter);
                
                // Create data rows
                const dataRows = data.map(row => {
                    return row.map(cell => {
                        let cellStr = cell.toString();
                        if (escapeQuotes && cellStr.includes(quoteChar)) {
                            cellStr = cellStr.replace(new RegExp(quoteChar, 'g'), quoteChar + quoteChar);
                        }
                        return escapeQuotes && (cellStr.includes(delimiter) || cellStr.includes('\n') || cellStr.includes(quoteChar)) 
                            ? quote + cellStr + quote 
                            : cellStr;
                    }).join(delimiter);
                });
                
                return [headerRow, ...dataRows].join('\n');
            }
            
            // Helper function to update stats
            function updateStats(original, cleaned) {
                originalRows.textContent = original.length;
                cleanedRows.textContent = cleaned.length;
                removedRows.textContent = original.length - cleaned.length;
                originalCols.textContent = original[0] ? original[0].length : 0;
                cleanedCols.textContent = cleaned[0] ? cleaned[0].length : 0;
            }
            
            // Helper function to display issues
            function displayIssues(issues) {
                if (issues.length === 0) {
                    issuesList.classList.remove('active');
                    return;
                }
                
                issuesContainer.innerHTML = '';
                issues.forEach(issue => {
                    const issueElement = document.createElement('div');
                    issueElement.className = 'issue-item';
                    issueElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> <span>${issue}</span>`;
                    issuesContainer.appendChild(issueElement);
                });
                
                issuesList.classList.add('active');
            }
            
            // Helper function to display preview table
            function displayPreviewTable(data, headers) {
                // Clear existing table
                tableHeader.innerHTML = '';
                tableBody.innerHTML = '';
                
                // Create table headers
                headers.forEach(header => {
                    const th = document.createElement('th');
                    th.textContent = header;
                    tableHeader.appendChild(th);
                });
                
                // Create table rows
                data.forEach((row, rowIndex) => {
                    const tr = document.createElement('tr');
                    
                    // Check if row is empty (for highlighting)
                    const isEmptyRow = row.every(cell => !cell || cell.toString().trim() === '');
                    if (isEmptyRow) {
                        tr.classList.add('empty-row');
                    }
                    
                    row.forEach((cell, cellIndex) => {
                        const td = document.createElement('td');
                        td.textContent = cell !== undefined && cell !== null ? cell : '';
                        
                        // Check if cell is empty (for highlighting)
                        if (!cell || cell.toString().trim() === '') {
                            td.style.color = '#999';
                            td.style.fontStyle = 'italic';
                        }
                        
                        tr.appendChild(td);
                    });
                    
                    tableBody.appendChild(tr);
                });
            }
            
            // Helper function to show notifications
            function showNotification(message, type = 'success') {
                notification.textContent = message;
                notification.className = 'notification';
                
                // Set color based on type
                if (type === 'error') {
                    notification.style.backgroundColor = '#dc3545';
                } else if (type === 'success') {
                    notification.style.backgroundColor = '#667eea';
                } else if (type === 'warning') {
                    notification.style.backgroundColor = '#ffc107';
                }
                
                // Show notification
                notification.classList.add('show');
                
                // Hide after 3 seconds
                setTimeout(() => {
                    notification.classList.remove('show');
                }, 3000);
            }
            
            // Auto-load example on page load
            loadExample.click();
        });
    