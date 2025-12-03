import { useState, useMemo, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from './ui/sheet';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { useRecipes } from '../context/RecipeContext';
import { storage } from '../utils/localStorage';
import { supabaseStorage, shouldUseSupabase } from '../utils/supabaseStorage';
import WeekSelector from './WeekSelector';
import MealAssignmentTable from './MealAssignmentTable';
import CalendarView from './CalendarView';
import { groupByAisle } from '../utils/aisleCategories';
import { sendShoppingListEmail } from '../utils/emailService';
import { createMealPlanEvents, refreshAccessToken } from '../utils/googleCalendarService';
import { toast } from 'sonner';
import { Loader2, Mail, Calendar, Save, FolderOpen, Trash2 } from 'lucide-react';
import { format, startOfWeek, addDays, parseISO } from 'date-fns';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function Cart({ open, onOpenChange }) {
  const { cartItems, updateCartItem, removeFromCart, clearCart, addToCart } = useCart();
  const { settings, updateGoogleTokens } = useSettings();
  const { recipes } = useRecipes();
  
  // Start with next Monday by default
  const getNextMonday = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = day === 0 ? 1 : 8 - day; // Next Monday
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + diff);
    return nextMonday;
  };

  const [selectedWeek, setSelectedWeek] = useState(getNextMonday());
  const [loading, setLoading] = useState(false);
  const [checkedItems, setCheckedItems] = useState(new Set());
  const [templates, setTemplates] = useState([]);
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'

  // Load templates from Supabase or localStorage
  useEffect(() => {
    const loadTemplates = async () => {
      if (shouldUseSupabase()) {
        const savedTemplates = await supabaseStorage.templates.get();
        setTemplates(savedTemplates || []);
      } else {
        const savedTemplates = storage.templates.get();
        setTemplates(savedTemplates || []);
      }
    };
    loadTemplates();
  }, []);

  // Get all ingredients from assigned recipes
  const assignedItems = useMemo(() => {
    return cartItems.filter(item => item.cook && item.day);
  }, [cartItems]);

  const allIngredients = useMemo(() => {
    const ingredientSet = new Set();
    
    assignedItems.forEach(item => {
      if (item.recipe && item.recipe.ingredients) {
        item.recipe.ingredients.forEach(ing => ingredientSet.add(ing));
      }
    });
    
    return Array.from(ingredientSet);
  }, [assignedItems]);

  // Generate aisle-sorted shopping list
  const categorizedIngredients = useMemo(() => {
    if (allIngredients.length === 0) return {};
    return groupByAisle(allIngredients);
  }, [allIngredients]);

  // Generate shopping list markdown
  const generateShoppingListMarkdown = () => {
    const monday = startOfWeek(selectedWeek, { weekStartsOn: 1 });
    const sunday = addDays(monday, 6);
    const weekRange = `${format(monday, 'MMM d')} - ${format(sunday, 'MMM d, yyyy')}`;

    let markdown = `# Shopping List\n\n`;
    markdown += `## Week of ${weekRange}\n\n`;

      if (assignedItems.length > 0) {
        markdown += `### Recipes This Week:\n\n`;
        assignedItems.forEach(item => {
          markdown += `- ${item.recipe.title} (${item.cook} - ${item.day})\n`;
        });
        markdown += `\n`;
      }

    // Categorized ingredients
    const categories = Object.keys(categorizedIngredients).sort();
    if (categories.length > 0) {
      categories.forEach(category => {
        const items = categorizedIngredients[category];
        if (items && items.length > 0) {
          markdown += `### ${category}\n`;
          items.forEach(ing => {
            markdown += `- [ ] ${ing}\n`;
          });
          markdown += `\n`;
        }
      });
    } else {
      // Fallback: uncategorized
      markdown += `### All Ingredients\n`;
      allIngredients.forEach(ing => {
        markdown += `- [ ] ${ing}\n`;
      });
    }

    return markdown;
  };

  // Generate shopping list HTML
  const generateShoppingListHTML = () => {
    const monday = startOfWeek(selectedWeek, { weekStartsOn: 1 });
    const sunday = addDays(monday, 6);
    const weekRange = `${format(monday, 'MMM d')} - ${format(sunday, 'MMM d, yyyy')}`;

    let html = `<h2 style="margin: 0 0 16px 0; padding: 0;">Shopping List</h2>`;
    html += `<p style="margin: 0 0 24px 0; padding: 0;"><strong>Week of ${weekRange}</strong></p>`;

    if (assignedItems.length > 0) {
      html += `<h3 style="margin: 0 0 12px 0; padding: 0;">Recipes This Week:</h3>`;
      html += `<ul style="margin: 0 0 24px 0; padding-left: 20px;">`;
      assignedItems.forEach(item => {
        html += `<li style="margin: 4px 0; padding: 0;">${item.recipe.title} (${item.cook} - ${item.day})</li>`;
      });
      html += `</ul>`;
    }

    const categories = Object.keys(categorizedIngredients);
    if (categories.length > 0) {
      categories.forEach(category => {
        const items = categorizedIngredients[category];
        if (items && items.length > 0) {
          html += `<h3 style="margin-top: 20px; font-size: 16px; font-weight: bold;">${category}</h3>`;
          html += `<ul style="list-style: none; padding-left: 0;">`;
          items.forEach(ing => {
            html += `<li style="padding: 4px 0;">☐ ${ing}</li>`;
          });
          html += `</ul>`;
        }
      });
    }

    return html;
  };

  // Generate shopping list plain text
  const generateShoppingListText = () => {
    const monday = startOfWeek(selectedWeek, { weekStartsOn: 1 });
    const sunday = addDays(monday, 6);
    const weekRange = `${format(monday, 'MMM d')} - ${format(sunday, 'MMM d, yyyy')}`;

    let text = `Shopping List - Week of ${weekRange}\n\n`;

    const categories = Object.keys(categorizedIngredients).sort();
    if (categories.length > 0) {
      categories.forEach(category => {
        const items = categorizedIngredients[category];
        if (items && items.length > 0) {
          text += `${category}:\n`;
          items.forEach(ing => {
            text += `  [ ] ${ing}\n`;
          });
          text += `\n`;
        }
      });
    }

    return text;
  };

  // Generate schedule for email
  const generateSchedule = () => {
    const monday = startOfWeek(selectedWeek, { weekStartsOn: 1 });
    
    return assignedItems.map(item => {
      const dayIndex = DAYS_OF_WEEK.indexOf(item.day);
      const date = addDays(monday, dayIndex);
      
      return {
        day: `${item.day}, ${format(date, 'MMM d')}`,
        cook: item.cook,
        recipe: item.recipe.title,
        date: date,
        recipeData: item.recipe,
      };
    });
  };

  const handleSendEmailAndCalendar = async () => {
    if (assignedItems.length === 0) {
      toast.error('Assign everyone first. No free rides.');
      return;
    }

    if (!settings.emailAddress) {
      toast.error('Add your email in Settings first');
      return;
    }

    if (!settings.emailjsServiceId || !settings.emailjsTemplateId || !settings.emailjsPublicKey) {
      toast.error('Set up EmailJS in Settings to send emails');
      return;
    }

    setLoading(true);

    try {
      // Generate shopping list content
      const monday = startOfWeek(selectedWeek, { weekStartsOn: 1 });
      const sunday = addDays(monday, 6);
      const weekRange = `${format(monday, 'MMM d')} - ${format(sunday, 'MMM d, yyyy')}`;
      
      const shoppingListHtml = generateShoppingListHTML();
      const shoppingListText = generateShoppingListText();
      const shoppingListMarkdown = generateShoppingListMarkdown();
      const schedule = generateSchedule();

      // Send email
      let emailSuccess = false;
      try {
        // Combine primary email with additional recipients
        const allRecipients = [
          settings.emailAddress,
          ...(settings.additionalEmails || [])
        ].filter(Boolean);
        
        const emailResult = await sendShoppingListEmail({
          toEmails: allRecipients,
          weekRange,
          schedule,
          shoppingListHtml,
          shoppingListText,
          shoppingListMarkdown,
          emailjsServiceId: settings.emailjsServiceId,
          emailjsTemplateId: settings.emailjsTemplateId,
          emailjsPublicKey: settings.emailjsPublicKey,
          supabaseUrl: settings.supabaseUrl,
          supabaseAnonKey: settings.supabaseAnonKey,
        });

        console.log('EmailJS result:', emailResult);

        if (emailResult.successful > 0) {
          emailSuccess = true;
          if (emailResult.failed > 0) {
            const errorDetails = emailResult.errors?.map(e => `${e.email}: ${e.error}`).join('; ') || 'Unknown error';
              toast.warning(`Sent to ${emailResult.successful}, but ${emailResult.failed} failed. Check console.`);
            console.error('Failed emails:', emailResult.errors);
          } else {
              toast.success(`Sent to ${emailResult.successful} people!`);
          }
        } else {
          const errorDetails = emailResult.errors?.map(e => `${e.email}: ${e.error}`).join('; ') || 'Unknown error';
            toast.error(`Couldn't send to anyone. Check console.`);
          console.error('EmailJS configuration:', {
            serviceId: settings.emailjsServiceId ? 'Set' : 'Missing',
            templateId: settings.emailjsTemplateId ? 'Set' : 'Missing',
            publicKey: settings.emailjsPublicKey ? 'Set' : 'Missing',
            recipients: allRecipients,
          });
          console.error('Failed emails:', emailResult.errors);
        }
      } catch (emailError) {
        console.error('Email sending error:', emailError);
        console.error('EmailJS configuration:', {
          serviceId: settings.emailjsServiceId ? 'Set' : 'Missing',
          templateId: settings.emailjsTemplateId ? 'Set' : 'Missing',
          publicKey: settings.emailjsPublicKey ? 'Set' : 'Missing',
        });
        toast.error(`Failed: ${emailError.message}`);
      }

      // Create calendar events if Google Calendar is connected
      if (settings.googleAccessToken && settings.googleClientId) {
        try {
          let accessToken = settings.googleAccessToken;
          
          // Try to refresh token if we have a refresh token
          if (settings.googleRefreshToken && settings.googleClientSecret) {
            try {
              console.log('Attempting to refresh Google Calendar access token...');
              const refreshedTokens = await refreshAccessToken(
                settings.googleRefreshToken,
                settings.googleClientId,
                settings.googleClientSecret
              );
              
              // Update stored tokens
              if (refreshedTokens.access_token) {
                accessToken = refreshedTokens.access_token;
                updateGoogleTokens({
                  access_token: refreshedTokens.access_token,
                  refresh_token: refreshedTokens.refresh_token || settings.googleRefreshToken,
                });
                console.log('Google Calendar token refreshed successfully');
              }
            } catch (refreshError) {
              console.warn('Token refresh failed, trying with existing token:', refreshError);
              // Continue with existing token - it might still be valid
            }
          }
          
          // Create events
          const events = schedule.map(item => {
            const eventDate = item.date;
            const startDateTime = new Date(eventDate);
            startDateTime.setHours(17, 0, 0, 0); // 5:00 PM
            const endDateTime = new Date(eventDate);
            endDateTime.setHours(18, 0, 0, 0); // 6:00 PM

            return {
              cook: item.cook,
              recipe: item.recipe,
              recipeData: item.recipeData,
              startDateTime: startDateTime.toISOString(),
              endDateTime: endDateTime.toISOString(),
            };
          });

          console.log(`Creating ${events.length} calendar events...`);
          // Combine primary email with additional recipients for calendar invites
          const allAttendeeEmails = [
            settings.emailAddress,
            ...(settings.additionalEmails || [])
          ].filter(Boolean);
          
          const calendarResult = await createMealPlanEvents({
            accessToken,
            events,
            attendeeEmails: allAttendeeEmails,
          });

          if (calendarResult.successful > 0) {
            toast.success(`Added ${calendarResult.successful} events to calendar!`);
            if (calendarResult.failed > 0) {
              toast.warning(`${calendarResult.failed} events failed. Check console.`);
              console.error('Calendar event errors:', calendarResult.errors);
            }
          } else if (calendarResult.failed > 0) {
            toast.error(`Calendar events failed: ${calendarResult.errors.join(', ')}`);
            console.error('All calendar events failed:', calendarResult.errors);
          }
        } catch (calendarError) {
          console.error('Calendar error details:', calendarError);
          const errorMessage = calendarError.message || 'Unknown error';
          
          // Check for common error types
          if (errorMessage.includes('invalid_grant') || errorMessage.includes('token') || errorMessage.includes('401')) {
            toast.error('Google Calendar disconnected. Reconnect in Settings.');
          } else if (errorMessage.includes('403') || errorMessage.includes('permission')) {
            toast.error('Calendar permission denied. Check your OAuth setup.');
          } else {
            toast.error(`Calendar events failed: ${errorMessage}`);
          }
        }
      } else if (emailSuccess) {
        // Only show this if email succeeded but calendar isn't configured
        toast.info('Email sent! Connect Google Calendar in Settings to also add to your calendar.');
      }

      // Show final summary
      if (emailSuccess) {
        toast.success('Boom. Plan sent!');
      }
    } catch (error) {
      console.error('Error sending meal plan:', error);
      toast.error(`Something went wrong: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleItem = (ingredient) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(ingredient)) {
        next.delete(ingredient);
      } else {
        next.add(ingredient);
      }
      return next;
    });
  };

  const assignedCount = assignedItems.length;

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      toast.error('Give it a name');
      return;
    }

    if (assignedItems.length === 0) {
      toast.error('Assign meals to days first');
      return;
    }

    const template = {
      id: Date.now().toString(),
      name: templateName.trim(),
      items: assignedItems.map(item => ({
        recipeId: item.recipeId,
        cook: item.cook,
        day: item.day,
      })),
      createdAt: new Date().toISOString(),
    };

    const newTemplates = [...templates, template];
    setTemplates(newTemplates);
    
    // Save to Supabase or localStorage
    if (shouldUseSupabase()) {
      supabaseStorage.templates.set(newTemplates).catch(err => {
        console.error('Error saving template to Supabase:', err);
        storage.templates.set(newTemplates);
      });
    } else {
      storage.templates.set(newTemplates);
    }
    
    setSaveTemplateOpen(false);
    setTemplateName('');
    toast.success(`"${template.name}" saved!`);
  };

  const handleLoadTemplate = (template) => {
    // Clear current cart
    clearCart();
    
    // Add recipes from template
    template.items.forEach(({ recipeId, cook, day }) => {
      const recipe = recipes.find(r => r.id === recipeId);
      if (recipe) {
        addToCart(recipe);
        // Update assignment
        setTimeout(() => {
          updateCartItem(recipeId, { cook, day });
        }, 100);
      }
    });
    
    toast.success(`"${template.name}" loaded!`);
  };

  const handleDeleteTemplate = (templateId) => {
    const newTemplates = templates.filter(t => t.id !== templateId);
    setTemplates(newTemplates);
    
    // Save to Supabase or localStorage
    if (shouldUseSupabase()) {
      supabaseStorage.templates.set(newTemplates).catch(err => {
        console.error('Error deleting template from Supabase:', err);
        storage.templates.set(newTemplates);
      });
    } else {
      storage.templates.set(newTemplates);
    }
    
    toast.success('Template deleted');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>This Week's Plan</SheetTitle>
          <SheetDescription>
            Assign meals, generate the shopping list, and finally have an answer when babe asks.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Meal Plan Templates */}
          {templates.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Saved Plans</CardTitle>
                <CardDescription>Reuse a plan from before</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {templates.map(template => (
                    <div key={template.id} className="flex items-center gap-2 border rounded-md p-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLoadTemplate(template)}
                      >
                        <FolderOpen className="h-4 w-4 mr-2" />
                        {template.name}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4 text-gray-800 dark:text-white hover:text-red-500 dark:hover:text-red-500 transition-colors" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Week Selector */}
          <Card>
            <CardHeader>
              <CardTitle>Week</CardTitle>
            </CardHeader>
            <CardContent>
              <WeekSelector selectedWeek={selectedWeek} onWeekChange={setSelectedWeek} />
            </CardContent>
          </Card>

          {/* Meal Assignment */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Who's Making What</CardTitle>
                  <CardDescription>
                    Assign each meal to a cook and day. No ambiguity. No excuses.
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    List
                  </Button>
                  <Button
                    variant={viewMode === 'calendar' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('calendar')}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Calendar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {viewMode === 'list' ? (
                <MealAssignmentTable
                  cartItems={cartItems}
                  selectedWeek={selectedWeek}
                  cookNames={settings.cookNames}
                  onUpdateAssignment={(recipeId, field, value) => {
                    updateCartItem(recipeId, { [field]: value });
                  }}
                  onRemoveItem={removeFromCart}
                />
              ) : (
                <CalendarView
                  cartItems={cartItems}
                  selectedWeek={selectedWeek}
                />
              )}
            </CardContent>
          </Card>

          {/* Shopping List */}
          {allIngredients.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Shopping List</CardTitle>
                <CardDescription>
                  {allIngredients.length} items, sorted by aisle so you're not wandering around like a lost puppy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  {Object.keys(categorizedIngredients).length > 0 ? (
                    <div className="space-y-4">
                      {Object.keys(categorizedIngredients).sort().map(category => {
                        const items = categorizedIngredients[category];
                        if (!items || items.length === 0) return null;
                        
                        return (
                          <div key={category}>
                            <h4 className="font-semibold mb-2">{category}</h4>
                            <div className="space-y-2">
                              {items.map((ing, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`item-${category}-${index}`}
                                    checked={checkedItems.has(ing)}
                                    onCheckedChange={() => handleToggleItem(ing)}
                                  />
                                  <label
                                    htmlFor={`item-${category}-${index}`}
                                    className="text-sm cursor-pointer flex-1"
                                  >
                                    {ing}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {allIngredients.map((ing, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Checkbox
                            id={`item-${index}`}
                            checked={checkedItems.has(ing)}
                            onCheckedChange={() => handleToggleItem(ing)}
                          />
                          <label htmlFor={`item-${index}`} className="text-sm cursor-pointer flex-1">
                            {ing}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-2">
            {assignedItems.length > 0 && (
              <Dialog open={saveTemplateOpen} onOpenChange={setSaveTemplateOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Save className="mr-2 h-4 w-4" />
                    Save as Template
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Save This Plan</DialogTitle>
                    <DialogDescription>
                      Name it something you'll remember
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="template-name">Plan Name</Label>
                      <Input
                        id="template-name"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        placeholder="e.g., Lazy Week, Healthy-ish, The Classics"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveTemplate();
                          }
                        }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveTemplate} className="flex-1">
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSaveTemplateOpen(false);
                          setTemplateName('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            
            <Button
              onClick={handleSendEmailAndCalendar}
              disabled={loading || assignedCount === 0 || cartItems.length === 0}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send the Plan
                </>
              )}
            </Button>

            <Button
              variant="outline"
              className="border-orange-300 text-orange-700 hover:bg-orange-50 hover:text-orange-800 hover:border-orange-400 dark:border-orange-600 dark:text-orange-400 dark:hover:bg-orange-950 dark:hover:text-orange-300 dark:hover:border-orange-500"
              onClick={() => {
                clearCart();
                toast.success('Starting fresh');
              }}
              disabled={cartItems.length === 0}
            >
              Start Over
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

