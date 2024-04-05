TODO

- figure out how to not clobber global styles with radix ones
- figure out flash of layout changes when things mount/unmount
- different paymasters with different behavior
  - diff addresses per paymaster
  - diff ways to top up paymaster
  - detect balance of each, use priority list or highest balance?
  - "top up" should have its own set of "requirements" like the global login does
- play around with moving requirements to a hook for each component/screen
  - maybe can detect when a component is rendered as null? or when it throws?
  - would suspense help?
- handle interacting with UI if we've not fully logged in
- figure out why waitForTransaction stalls and is slower than getting events
- wallet client -> user account client
