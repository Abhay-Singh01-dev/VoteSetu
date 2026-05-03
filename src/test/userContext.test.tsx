import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { UserProvider, useUser } from "@/context/UserContext";

const STORAGE_KEY = "votesetu.user";

const TestConsumer = () => {
  const { user, setUser, resetUser } = useUser();

  return (
    <div>
      <div data-testid="user-state">{JSON.stringify(user)}</div>
      <button onClick={() => setUser({ age: 21, isRegistered: true, hasEpic: false })}>
        set-user
      </button>
      <button onClick={resetUser}>reset-user</button>
    </div>
  );
};

describe("UserProvider", () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it("loads user data from localStorage and persists updates", async () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        age: 19,
        isRegistered: false,
        hasEpic: false,
        completedSteps: ["2"],
        skippedSteps: ["warning_dismissed"],
      }),
    );

    render(
      <UserProvider>
        <TestConsumer />
      </UserProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("user-state")).toHaveTextContent('"age":19');
    });

    fireEvent.click(screen.getByText("set-user"));

    await waitFor(() => {
      expect(window.localStorage.getItem(STORAGE_KEY)).toContain('"age":21');
    });
  });

  it("falls back safely on invalid persisted data and resets cleanly", async () => {
    window.localStorage.setItem(STORAGE_KEY, "{invalid-json");

    render(
      <UserProvider>
        <TestConsumer />
      </UserProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("user-state")).toHaveTextContent('"completedSteps":[]');
    });

    act(() => {
      fireEvent.click(screen.getByText("reset-user"));
    });

    await waitFor(() => {
      expect(screen.getByTestId("user-state")).not.toHaveTextContent('"age":');
    });
  });
});
