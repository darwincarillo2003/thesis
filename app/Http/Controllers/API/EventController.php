<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Organization;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class EventController extends Controller
{
    /**
     * Display a listing of events for the authenticated user.
     */
    public function index(Request $request)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }
            $user->load(['organizations', 'role']);

            // Debug logging
            \Log::info('EventController@index - User loaded:', [
                'user_id' => $user->user_id,
                'role_id' => $user->role_id,
                'role_name' => $user->role ? $user->role->role_name : 'No role',
                'organizations' => $user->organizations->toArray()
            ]);

            $query = Event::with(['creator', 'creator.profile', 'creator.role']);

            if ($request->has('date') && $request->date) {
                $query->onDate($request->date);
            }

            if ($request->has('upcoming') && $request->boolean('upcoming')) {
                $query->upcoming($request->get('days', 30));
            }

            // Apply organization filtering
            if ($user) {
                \Log::info('EventController@index - Applying user organization filter');
                
                // COA and Admin can see all events
                if ($user->role && in_array($user->role->role_name, ['coa', 'admin'])) {
                    \Log::info('EventController@index - COA/Admin user detected, showing all events');
                    // Don't apply organization filter for COA/Admin
                } else {
                    $query->forUserOrganizations($user);
                }
            }

            $events = $query->orderBy('date', 'desc')
                ->orderBy('time', 'desc')
                ->get();

            // If no events found with organization filter, let's check total events
            if ($events->isEmpty()) {
                $totalEvents = Event::count();
                \Log::info('EventController@index - No events found with filter, total events in system:', [
                    'total_events' => $totalEvents
                ]);
                
                if ($totalEvents > 0) {
                    \Log::info('EventController@index - Events exist but filtered out, checking without filter');
                    $allEvents = Event::with(['creator', 'creator.profile', 'creator.role'])
                        ->upcoming($request->get('days', 365))
                        ->orderBy('date', 'asc')
                        ->orderBy('time', 'asc')
                        ->take(5)
                        ->get();
                    \Log::info('EventController@index - Sample events without filter:', $allEvents->toArray());
                }
            }

            // Debug logging
            \Log::info('EventController@index - Events found:', [
                'count' => $events->count(),
                'events' => $events->map(function($event) {
                    return [
                        'id' => $event->id,
                        'title' => $event->title,
                        'date' => $event->date,
                        'target_organizations' => $event->target_organizations,
                        'creator' => $event->creator ? $event->creator->email : 'No creator'
                    ];
                })->toArray()
            ]);

            $transformedEvents = $events->map(function ($event) {
                return [
                    'id' => $event->id,
                    'title' => $event->title,
                    'description' => $event->description,
                    'date' => $event->date->format('Y-m-d'),
                    'time' => $event->time ? $event->time->format('H:i') : null,
                    'location' => $event->location,
                    'priority' => $event->priority,
                    'status' => $event->status,
                    // ✅ Always snake_case
                    'target_organizations' => $event->target_organizations ?? [],
                    'created_by' => $event->created_by,
                    'created_at' => $event->created_at->format('Y-m-d\TH:i:s\Z'),
                    'creator' => $event->creator ? [
                        'id' => $event->creator->user_id,
                        'name' => ($event->creator->profile ? $event->creator->profile->first_name . ' ' . $event->creator->profile->last_name : 'Unknown'),
                        'email' => $event->creator->email,
                        'profile_pic' => $event->creator->profile ? $event->creator->profile->profile_pic : null,
                        'role' => $event->creator->role ? $event->creator->role->role_name : 'Unknown'
                    ] : null
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'events' => $transformedEvents,
                    'total' => $transformedEvents->count()
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch events',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created event.
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'date' => 'required|date|after_or_equal:today',
                'time' => 'nullable|date_format:H:i',
                'location' => 'required|string|max:255',
                'priority' => 'required|in:low,normal,high,urgent',
                'target_organizations' => 'required|array|min:1',
                'target_organizations.*' => 'string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();

            $event = Event::create([
                'title' => $request->title,
                'description' => $request->description,
                'date' => $request->date,
                'time' => $request->time,
                'location' => $request->location,
                'priority' => $request->priority,
                'status' => 'scheduled',
                'target_organizations' => $request->target_organizations,
                'created_by' => $user->user_id
            ]);

            $event->load(['creator', 'creator.profile', 'creator.role']);

            return response()->json([
                'success' => true,
                'message' => 'Event created successfully',
                'data' => [
                    'event' => [
                        'id' => $event->id,
                        'title' => $event->title,
                        'description' => $event->description,
                        'date' => $event->date->format('Y-m-d'),
                        'time' => $event->time ? $event->time->format('H:i') : null,
                        'location' => $event->location,
                        'priority' => $event->priority,
                        'status' => $event->status,
                        // ✅ fixed
                        'target_organizations' => $event->target_organizations ?? [],
                        'created_by' => $event->created_by,
                        'created_at' => $event->created_at->format('Y-m-d\TH:i:s\Z'),
                        'creator' => $event->creator ? [
                            'id' => $event->creator->user_id,
                            'name' => ($event->creator->profile ? $event->creator->profile->first_name . ' ' . $event->creator->profile->last_name : 'Unknown'),
                            'email' => $event->creator->email,
                            'profile_pic' => $event->creator->profile ? $event->creator->profile->profile_pic : null,
                            'role' => $event->creator->role ? $event->creator->role->role_name : 'Unknown'
                        ] : null
                    ]
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create event',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified event.
     */
    public function update(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'date' => 'required|date',
                'time' => 'nullable|date_format:H:i',
                'location' => 'required|string|max:255',
                'priority' => 'required|in:low,normal,high,urgent',
                'status' => 'required|in:scheduled,completed,cancelled',
                'target_organizations' => 'required|array|min:1',
                'target_organizations.*' => 'string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();

            $event = Event::where('created_by', $user->user_id)
                ->findOrFail($id);

            $event->update([
                'title' => $request->title,
                'description' => $request->description,
                'date' => $request->date,
                'time' => $request->time,
                'location' => $request->location,
                'priority' => $request->priority,
                'status' => $request->status,
                'target_organizations' => $request->target_organizations
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Event updated successfully',
                'data' => [
                    'event' => [
                        'id' => $event->id,
                        'title' => $event->title,
                        'description' => $event->description,
                        'date' => $event->date->format('Y-m-d'),
                        'time' => $event->time ? $event->time->format('H:i') : null,
                        'location' => $event->location,
                        'priority' => $event->priority,
                        'status' => $event->status,
                        // ✅ fixed
                        'target_organizations' => $event->target_organizations ?? [],
                        'created_by' => $event->created_by,
                        'created_at' => $event->created_at->format('Y-m-d\TH:i:s\Z')
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update event',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete the specified event.
     */
    public function destroy($id)
    {
        try {
            $user = Auth::user();

            $event = Event::where('created_by', $user->user_id)
                ->findOrFail($id);

            $event->delete();

            return response()->json([
                'success' => true,
                'message' => 'Event deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete event',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get organizations list for event creation
     */
    public function getOrganizations()
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            $organizations = Organization::select('organization_id', 'organization_name')
                ->groupBy('organization_id', 'organization_name')
                ->orderBy('organization_name')
                ->get();

            // ✅ Ensure uniqueness by ID
            $unique = $organizations->unique('organization_id')->values();

            return response()->json([
                'success' => true,
                'organizations' => $unique
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch organizations',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
