# InnerMirror MVP Release Checklist

## 1. Public / Private Boundary

- [ ] Public repo contains UI, visualization, fallback UX, and API contract only.
- [ ] Private repo contains state analysis, risk scoring, recovery signal, hybrid recommendation logic, and prompt contract.
- [ ] No private prompt or scoring logic is exposed in the public repo.
- [ ] Public app can run safely even when private engine is unavailable.

## 2. Public App UI

- [ ] Topic management works.
- [ ] Decision version creation works.
- [ ] Version history renders correctly.
- [ ] Topic graph renders correctly.
- [ ] Coaching performance dashboard renders correctly.
- [ ] Strategy state summary renders correctly.
- [ ] Risk summary renders correctly.
- [ ] Strategy evolution timeline renders correctly.
- [ ] Stability score renders correctly.
- [ ] Recovery signal renders correctly.
- [ ] AI coaching explanation renders correctly.

## 3. Private Engine Connection

- [ ] Supabase Edge Function recommendation endpoint is deployed.
- [ ] Public app receives 200 response from recommendation endpoint.
- [ ] Response includes source, strategy, confidence, reason, recommendationText.
- [ ] Response includes analysis field.
- [ ] analysis.state is returned.
- [ ] analysis.risk is returned.
- [ ] analysis.stabilityScore is returned.
- [ ] analysis.recoverySignal is returned.
- [ ] analysis.coachingEvolution is returned.

## 4. Fallback Safety

- [ ] Public app does not crash when private engine fails.
- [ ] Fallback recommendation is shown when private engine is unavailable.
- [ ] analysis:null does not break rendering.
- [ ] Console has no fatal render errors.
- [ ] Network failures are logged without blocking the app.

## 5. Supabase

- [ ] Tables exist for decision versions.
- [ ] Tables exist for topics.
- [ ] Tables exist for coaching feedback.
- [ ] RLS policies are enabled.
- [ ] User data is scoped by user_id.
- [ ] Edge Function is deployed after private engine update.
- [ ] Supabase anon key is not hardcoded outside intended public usage.
- [ ] Service role key is never exposed in public app.

## 6. Auth

- [ ] Login flow works.
- [ ] Logout flow works.
- [ ] Logged-in user can create records.
- [ ] Logged-in user can retrieve records.
- [ ] Unauthenticated state is handled safely.

## 7. Browser Test

- [ ] Chrome desktop tested.
- [ ] Mobile viewport checked.
- [ ] Refresh keeps data stable.
- [ ] DevTools Console has no critical errors.
- [ ] DevTools Network shows recommendation 200 response.
- [ ] Supabase fetch requests return expected status.

## 8. README / Docs

- [ ] Public README explains product purpose.
- [ ] Public README does not expose private engine logic.
- [ ] Private README explains engine boundary.
- [ ] MVP release checklist exists.
- [ ] API contract is documented.
- [ ] Hybrid recommendation boundary is documented.

## 9. MVP Release Decision

MVP can be released when:

- Public app is stable.
- Private engine connection works.
- Fallback works.
- User can complete first decision record within 3 minutes.
- Dashboard gives understandable feedback.
- No private core logic is exposed.