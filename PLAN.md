# DIRECTIVE
DO NOT USE write_to_file - IT FAILS CONSISTENTLY
Use echo, cat, or other commands instead

# WORKING COMPONENTS NEEDED

1. Input Page
   - Simple text box
   - Submit button
   -> app/routes/_index.tsx

2. Processing
   - Basic LLM handler
   - Simple response parser
   -> app/services/llm/basic.ts

3. Visualization
   - Basic SVG/Canvas renderer
   - Show result immediately
   -> app/components/visualization/basic.tsx

4. Storage
   - Save visualization
   - Save metadata
   -> app/lib/persistence/visualizations.ts

5. Dashboard
   - Grid of saved items
   - Click to view
   -> app/routes/dashboard.tsx

# BUILD ORDER
1. Input page first
2. Connect to ANY LLM
3. Show basic viz
4. Add save
5. Show dashboard

TEST EACH PIECE BEFORE MOVING ON
