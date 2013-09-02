class AddColorToSchedule < ActiveRecord::Migration
  def change
    add_column :schedules, :color, :string
  end
end
