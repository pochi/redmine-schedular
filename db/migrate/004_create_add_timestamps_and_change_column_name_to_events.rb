class CreateAddTimestampsAndChangeColumnNameToEvents < ActiveRecord::Migration
  def change
    rename_column :events, :contents, :content
    add_column :events, :created_at, :datetime
    add_column :events, :updated_at, :datetime
  end
end
