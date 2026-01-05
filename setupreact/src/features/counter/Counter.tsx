import { useAppDispatch } from "../../hooks/useAppDispatch.js";
import { useAppSelector } from "../../hooks/useAppSelector.js";
import { increment, decrement } from "./counterSlice.js";

export default function Counter() {
  const count = useAppSelector((state) => state.counter.value);
  const dispatch = useAppDispatch();

  return (
    <div>
      <h1>Count: {count}</h1>

      <button onClick={() => dispatch(increment())}>+1</button>
      <button onClick={() => dispatch(decrement())}>-1</button>
    </div>
  );
}
