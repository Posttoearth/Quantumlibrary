import numpy as np
import random
import matplotlib.pyplot as plt
from collections import Counter

# --- 1. HP Model Setup ---

def parse_sequence(sequence_str):
    """Converts a string like 'PHPH' into a list of 0s (P) and 1s (H)."""
    return [1 if char == 'H' else 0 for char in sequence_str.upper()]

def get_neighbors(x, y):
    """Returns the (x, y) coordinates of adjacent cells on a 2D square lattice."""
    return [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]

def calculate_energy(protein_sequence_hp, protein_path):
    """
    Calculates the energy of a protein configuration based on the HP model.
    Energy is the negative count of non-bonded H-H contacts.
    """
    energy = 0
    num_residues = len(protein_sequence_hp)
    
    # Create a set of H-residue coordinates for quick lookup
    h_coords = set()
    for i in range(num_residues):
        if protein_sequence_hp[i] == 1: # Is an 'H' residue
            h_coords.add(protein_path[i])

    # Check for H-H contacts
    for i in range(num_residues):
        if protein_sequence_hp[i] == 1: # Only 'H' residues contribute to contacts
            current_h_coord = protein_path[i]
            
            for neighbor_coord in get_neighbors(current_h_coord[0], current_h_coord[1]):
                # Check if the neighbor is also an 'H' residue
                if neighbor_coord in h_coords:
                    # Find the index of the neighboring H residue
                    neighbor_idx = protein_path.index(neighbor_coord)
                    
                    # Ensure it's a non-bonded contact:
                    # - The neighbor_idx must be greater than current_idx to avoid double counting
                    # - They must not be consecutive in the primary sequence (|i - neighbor_idx| > 1)
                    if neighbor_idx > i and abs(i - neighbor_idx) > 1:
                        energy -= 1 # Each H-H contact contributes -1 energy
    return energy

def is_valid_path(path):
    """
    Checks if a given protein path is valid:
    1. No self-intersections (each coordinate is unique).
    2. Maintains connectivity (adjacent residues in sequence are adjacent on lattice).
    """
    # 1. No self-intersections
    if len(set(path)) != len(path):
        return False
    
    # 2. Maintains connectivity
    for i in range(len(path) - 1):
        x1, y1 = path[i]
        x2, y2 = path[i+1]
        
        # Check if they are adjacent (Manhattan distance of 1)
        if abs(x1 - x2) + abs(y1 - y2) != 1:
            return False
            
    return True

def generate_random_path(num_residues):
    """
    Generates a random, valid initial path for the protein on a 2D lattice.
    Starts at (0,0) and randomly moves in allowed directions.
    """
    path = [(0, 0)]
    current_x, current_y = 0, 0

    for _ in range(num_residues - 1):
        possible_next_coords = get_neighbors(current_x, current_y)
        
        # Filter out moves that would cause a self-intersection
        valid_moves = [move for move in possible_next_coords if move not in path]
        
        if not valid_moves:
            # If no valid moves, it means we're stuck.
            # For robustness, could restart or implement more complex backtracking.
            # For simplicity, if stuck, we return a "bad" path that won't be valid.
            return [] 

        next_x, next_y = random.choice(valid_moves)
        path.append((next_x, next_y))
        current_x, current_y = next_x, next_y
        
    return path

# --- 2. Simulated Annealing Algorithm ---

def simulated_annealing(sequence_str, initial_temperature, final_temperature, cooling_rate, steps_per_temp):
    """
    Performs Simulated Annealing to find a low-energy protein configuration.
    
    Args:
        sequence_str (str): The HP sequence (e.g., 'PHPH').
        initial_temperature (float): Starting temperature.
        final_temperature (float): Ending temperature.
        cooling_rate (float): Multiplicative factor for cooling (e.g., 0.99).
        steps_per_temp (int): Number of attempted moves at each temperature.
        
    Returns:
        tuple: (best_path, best_energy, energy_history)
    """
    protein_sequence_hp = parse_sequence(sequence_str)
    num_residues = len(protein_sequence_hp)

    # Initialize with a random valid path
    current_path = []
    while not current_path: # Keep trying until a valid path is generated
        current_path = generate_random_path(num_residues)
        if not current_path:
             print("Warning: Could not generate a valid initial path. Trying again...")

    current_energy = calculate_energy(protein_sequence_hp, current_path)
    
    best_path = list(current_path)
    best_energy = current_energy
    
    energy_history = []
    temperature = initial_temperature

    print(f"Initial path: {current_path}, Initial energy: {current_energy}")

    while temperature > final_temperature:
        for _ in range(steps_per_temp):
            # Propose a new configuration (a "move")
            new_path = list(current_path) # Start with current path
            
            # Common moves for HP model:
            # 1. End-move: Move one end of the chain (if it doesn't self-intersect)
            # 2. Corner-move: Move a corner (3 residues)
            # 3. Crankshaft-move: Rotate a segment of the chain
            
            # For simplicity, let's implement a "random single-residue move"
            # This is more like a Monte Carlo step where we try to move *any* residue
            # but maintain connectivity and non-intersection.
            # A more sophisticated SA would use specific, well-defined moves.
            
            # Choose a random residue (not the first or last for simplicity of moves)
            # In real SA, moves are carefully designed to explore conformational space
            # and maintain connectivity. Here's a very simple 'pivot' type move.
            
            if num_residues < 3: # Need at least 3 for complex moves, so simplify for tiny chains
                # For very small chains, just regenerate a new random valid path
                proposed_path = generate_random_path(num_residues)
                
            else:
                # Attempt a pivot move: pick a random residue (not ends) and try to rotate part
                # This is a very rough implementation of a pivot for illustration.
                pivot_idx = random.randint(1, num_residues - 2) # Exclude ends
                pivot_x, pivot_y = current_path[pivot_idx]

                # Identify the segment to rotate (e.g., from pivot to end)
                segment_to_rotate = current_path[pivot_idx:]
                
                # Try simple 90-degree rotations around the pivot
                # This is highly simplified for demonstration!
                
                rotated_segment = []
                # Relative coordinates to pivot
                relative_coords = [(cx - pivot_x, cy - pivot_y) for cx, cy in segment_to_rotate]

                # Rotate 90 degrees clockwise (x,y -> y,-x)
                rotated_relative = [(y, -x) for x, y in relative_coords]
                
                # Translate back
                for i, (rx, ry) in enumerate(rotated_relative):
                    # For first element of rotated segment, it's the pivot itself
                    if i == 0:
                        rotated_segment.append((pivot_x, pivot_y))
                    else:
                        rotated_segment.append((pivot_x + rx, pivot_y + ry))

                # Assemble the proposed path
                proposed_path = current_path[:pivot_idx] + rotated_segment
            
            if not is_valid_path(proposed_path):
                # If the proposed move creates an invalid path (self-intersection, broken bond), skip it
                continue
                
            proposed_energy = calculate_energy(protein_sequence_hp, proposed_path)

            # Decide whether to accept the new configuration
            # Metropolis criterion
            delta_e = proposed_energy - current_energy
            if delta_e < 0: # New state is better
                current_path = list(proposed_path)
                current_energy = proposed_energy
            elif temperature > 0: # New state is worse, but accept with some probability
                acceptance_probability = np.exp(-delta_e / temperature)
                if random.random() < acceptance_probability:
                    current_path = list(proposed_path)
                    current_energy = proposed_energy
            
            # Update best found so far
            if current_energy < best_energy:
                best_energy = current_energy
                best_path = list(current_path)

        energy_history.append((temperature, current_energy))
        temperature *= cooling_rate # Cool down

    return best_path, best_energy, energy_history

# --- 3. Visualization ---

def plot_protein(sequence_str, path, energy, title="Protein Fold"):
    """
    Plots the 2D protein fold.
    """
    protein_sequence_hp = parse_sequence(sequence_str)
    
    # Extract coordinates
    x_coords = [p[0] for p in path]
    y_coords = [p[1] for p in path]

    plt.figure(figsize=(6, 6))
    plt.plot(x_coords, y_coords, 'k-') # Draw the backbone

    for i, (x, y) in enumerate(path):
        color = 'red' if protein_sequence_hp[i] == 1 else 'blue' # H is red, P is blue
        label = 'H' if protein_sequence_hp[i] == 1 else 'P'
        plt.plot(x, y, 'o', markersize=10, color=color, label=label if i == 0 else "")
        plt.text(x + 0.1, y + 0.1, str(i), fontsize=8) # Label residues with their index

    # Draw H-H contacts (non-bonded)
    h_coords = set()
    for i in range(len(protein_sequence_hp)):
        if protein_sequence_hp[i] == 1:
            h_coords.add(path[i])

    for i in range(len(protein_sequence_hp)):
        if protein_sequence_hp[i] == 1:
            current_h_coord = path[i]
            for neighbor_coord in get_neighbors(current_h_coord[0], current_h_coord[1]):
                if neighbor_coord in h_coords:
                    neighbor_idx = path.index(neighbor_coord)
                    if neighbor_idx > i and abs(i - neighbor_idx) > 1:
                        # Draw a dashed line for the contact
                        plt.plot([current_h_coord[0], neighbor_coord[0]],
                                 [current_h_coord[1], neighbor_coord[1]], 'g--', linewidth=0.5)

    plt.title(f"{title}\nEnergy: {energy}")
    plt.xlabel("X-coordinate")
    plt.ylabel("Y-coordinate")
    plt.grid(True)
    plt.gca().set_aspect('equal', adjustable='box') # Equal aspect ratio
    plt.show()

def plot_energy_history(energy_history):
    """Plots the energy evolution over time."""
    temperatures = [eh[0] for eh in energy_history]
    energies = [eh[1] for eh in energy_history]

    fig, ax1 = plt.subplots(figsize=(10, 6))

    color = 'tab:blue'
    ax1.set_xlabel('Temperature Steps')
    ax1.set_ylabel('Current Energy', color=color)
    ax1.plot(range(len(energies)), energies, color=color, marker='.', linestyle='-')
    ax1.tick_params(axis='y', labelcolor=color)

    ax2 = ax1.twinx()
    color = 'tab:red'
    ax2.set_ylabel('Temperature', color=color)
    ax2.plot(range(len(temperatures)), temperatures, color=color, linestyle='--')
    ax2.tick_params(axis='y', labelcolor=color)

    plt.title("Energy and Temperature Evolution in Simulated Annealing")
    plt.grid(True)
    plt.show()


# --- Main Execution ---

if __name__ == "__main__":
    # Example protein sequences (H = Hydrophobic, P = Polar)
    # The paper's sequences are much longer and more complex,
    # but this illustrates the HP model idea.
    
    # A simple 4-mer: H-P-P-H
    # Optimal energy is -1 (H1-H4 contact)
    # H P P H
    # | | | |
    # (0,0)-(1,0)-(1,1)-(0,1) -> H(0,0) and H(0,1) makes contact.
    protein_sequence = "HPPH" # Optimal energy -1

    # A slightly longer one, known to have interesting folds
    # protein_sequence = "HHPPHHPPHH" # 10 residues

    # A more complex one (longer simulation time needed)
    # protein_sequence = "HHPHPHPHPHH" # 11 residues
    
    print(f"Folding protein sequence: {protein_sequence}")

    # SA parameters
    initial_T = 1.0 # High enough to allow exploration
    final_T = 0.001 # Low enough to allow convergence
    cooling_factor = 0.999 # Rate at which temperature decreases (e.g., geometric cooling)
    steps_at_each_temp = 50 * len(protein_sequence) # More steps for larger proteins

    best_fold_path, min_energy, history = simulated_annealing(
        protein_sequence, initial_T, final_T, cooling_factor, steps_at_each_temp
    )

    print(f"\n--- SA Results for {protein_sequence} ---")
    print(f"Best path found: {best_fold_path}")
    print(f"Minimum energy found: {min_energy}")
    
    # Plot the best fold found
    if best_fold_path and is_valid_path(best_fold_path):
        plot_protein(protein_sequence, best_fold_path, min_energy, "Best Fold (Simulated Annealing)")
    else:
        print("Could not find a valid best fold to plot.")

    # Plot the energy and temperature history
    plot_energy_history(history)